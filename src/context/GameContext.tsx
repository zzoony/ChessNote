import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { GameState, ChessMove, BoardPosition } from '@/types';
import { 
  getInitialPosition, 
  generateSAN, 
  isValidMove, 
  getCurrentTurn,
  isInCheck,
  isCheckmate,
  isStalemate,
  executeSpecialMove,
  needsPromotion,
  squareToCoordinate
} from '@/utils/chessLogic';

// 액션 타입들
type GameAction =
  | { type: 'MAKE_MOVE'; payload: { from: string; to: string; promotion?: 'queen' | 'rook' | 'bishop' | 'knight' } }
  | { type: 'NEW_GAME' }
  | { type: 'UNDO_MOVE' }
  | { type: 'SET_POSITION'; payload: string };

// Context 타입
interface GameContextType {
  gameState: GameState;
  position: BoardPosition;
  isWhiteInCheck: boolean;
  isBlackInCheck: boolean;
  isGameOver: boolean;
  gameResult: string | null;
  pendingPromotion: { from: string; to: string } | null;
  makeMove: (from: string, to: string, promotion?: 'queen' | 'rook' | 'bishop' | 'knight') => boolean;
  newGame: () => void;
  undoMove: () => void;
}

// 초기 상태
const initialGameState: GameState = {
  position: '', // FEN 형식 (나중에 구현)
  moves: [],
  currentPlayer: 'white',
  gameStatus: 'playing',
  castlingRights: {
    whiteKingSide: true,
    whiteQueenSide: true,
    blackKingSide: true,
    blackQueenSide: true,
  },
  enPassantSquare: null,
  headers: {
    Date: new Date().toISOString().split('T')[0],
    White: '사용자',
    Black: '상대방',
    Result: '*', // 진행 중
  },
};

// Reducer 함수
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'MAKE_MOVE': {
      const { from, to, promotion } = action.payload;
      
      // 현재 보드 위치 재구성
      const currentPosition = getCurrentPosition(state.moves);
      
      // 특수 이동을 포함한 유효성 검사
      if (!isValidMove(from, to, currentPosition, true, state.castlingRights, state.enPassantSquare)) {
        return state; // 무효한 이동
      }
      
      const piece = currentPosition[from];
      if (!piece) return state;
      
      // 프로모션이 필요한데 지정되지 않은 경우
      if (needsPromotion(to, piece) && !promotion) {
        return state; // 프로모션 기물을 선택해야 함
      }
      
      try {
        // 특수 이동 실행
        const {
          newPosition,
          newCastlingRights,
          newEnPassantSquare,
          moveType,
          capturedPiece
        } = executeSpecialMove(
          from,
          to,
          currentPosition,
          state.castlingRights,
          state.enPassantSquare,
          promotion
        );
        
        // SAN 생성 (특수 이동 고려)
        let san = '';
        if (moveType === 'castle') {
          const side = squareToCoordinate(to)[0] > squareToCoordinate(from)[0] ? 'king' : 'queen';
          san = side === 'king' ? 'O-O' : 'O-O-O';
        } else {
          san = generateSAN(from, to, piece, capturedPiece);
          if (moveType === 'promotion') {
            const promotionSymbols = { queen: 'Q', rook: 'R', bishop: 'B', knight: 'N' };
            san += '=' + promotionSymbols[promotion || 'queen'];
          }
        }
        
        const newMove: ChessMove = {
          from,
          to,
          piece,
          san,
          fen: '', // 나중에 FEN 구현
          timestamp: new Date(),
          promotion,
          isCastle: moveType === 'castle',
          isEnPassant: moveType === 'enpassant',
          capturedPiece,
        };
        
        const newMoves = [...state.moves, newMove];
        const nextPlayer = getCurrentTurn(newMoves.length);
        
        // 게임 종료 상태 확인
        let gameStatus = state.gameStatus;
        let result = state.headers.Result;
        
        if (isCheckmate(newPosition, nextPlayer)) {
          gameStatus = 'checkmate';
          result = nextPlayer === 'white' ? '0-1' : '1-0';
        } else if (isStalemate(newPosition, nextPlayer)) {
          gameStatus = 'stalemate';
          result = '1/2-1/2';
        } else if (isInCheck(newPosition, nextPlayer)) {
          gameStatus = 'check';
        } else {
          gameStatus = 'playing';
        }
        
        // 체크/체크메이트 표시를 SAN에 추가
        if (gameStatus === 'checkmate') {
          san += '#';
        } else if (gameStatus === 'check') {
          san += '+';
        }
        
        return {
          ...state,
          moves: [...state.moves, { ...newMove, san }],
          currentPlayer: nextPlayer,
          gameStatus,
          castlingRights: newCastlingRights,
          enPassantSquare: newEnPassantSquare,
          headers: {
            ...state.headers,
            Result: result,
          },
        };
        
      } catch (error) {
        console.error('Move execution error:', error);
        return state;
      }
    }
    
    case 'NEW_GAME':
      return {
        ...initialGameState,
        headers: {
          ...initialGameState.headers,
          Date: new Date().toISOString().split('T')[0],
        },
      };
    
    case 'UNDO_MOVE':
      if (state.moves.length === 0) return state;
      
      const newMoves = state.moves.slice(0, -1);
      return {
        ...state,
        moves: newMoves,
        currentPlayer: getCurrentTurn(newMoves.length),
      };
    
    default:
      return state;
  }
};

// 현재 보드 위치 계산 (이동 히스토리에서)
const getCurrentPosition = (moves: ChessMove[]): BoardPosition => {
  let position = getInitialPosition();
  
  moves.forEach(move => {
    if (move.isCastle) {
      // 캐슬링 처리
      const piece = position[move.from];
      if (piece) {
        const side = squareToCoordinate(move.to)[0] > squareToCoordinate(move.from)[0] ? 'king' : 'queen';
        const rank = piece.color === 'white' ? '1' : '8';
        const rookFromSquare = side === 'king' ? 'h' + rank : 'a' + rank;
        const rookToSquare = side === 'king' ? 'f' + rank : 'd' + rank;
        
        // 킹과 룩 이동
        position[move.to] = piece;
        position[move.from] = null;
        position[rookToSquare] = position[rookFromSquare];
        position[rookFromSquare] = null;
      }
    } else if (move.isEnPassant) {
      // 앙파상 처리
      const piece = position[move.from];
      if (piece) {
        const captureRank = piece.color === 'white' ? '5' : '4';
        const captureSquare = move.to[0] + captureRank;
        
        position[move.to] = piece;
        position[move.from] = null;
        position[captureSquare] = null;
      }
    } else {
      // 일반 이동 (프로모션 포함)
      let piece = position[move.from];
      if (piece && move.promotion) {
        piece = { color: piece.color, type: move.promotion };
      }
      position[move.to] = piece;
      position[move.from] = null;
    }
  });
  
  return position;
};

// Context 생성
const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider 컴포넌트
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  const [pendingPromotion, setPendingPromotion] = React.useState<{ from: string; to: string } | null>(null);
  
  const makeMove = (from: string, to: string, promotion?: 'queen' | 'rook' | 'bishop' | 'knight'): boolean => {
    const currentPosition = getCurrentPosition(gameState.moves);
    const piece = currentPosition[from];
    
    // 프로모션이 필요한 경우
    if (piece && needsPromotion(to, piece) && !promotion) {
      setPendingPromotion({ from, to });
      return false; // 프로모션 선택 대기
    }
    
    setPendingPromotion(null);
    dispatch({ type: 'MAKE_MOVE', payload: { from, to, promotion } });
    return true;
  };
  
  const newGame = () => {
    setPendingPromotion(null);
    dispatch({ type: 'NEW_GAME' });
  };
  
  const undoMove = () => {
    setPendingPromotion(null);
    dispatch({ type: 'UNDO_MOVE' });
  };
  
  // 현재 보드 위치 계산
  const position = getCurrentPosition(gameState.moves);
  
  // 체크 상태 계산
  const isWhiteInCheck = isInCheck(position, 'white');
  const isBlackInCheck = isInCheck(position, 'black');
  
  // 게임 종료 상태
  const isGameOver = gameState.gameStatus === 'checkmate' || gameState.gameStatus === 'stalemate';
  const gameResult = isGameOver ? gameState.headers.Result : null;
  
  const value: GameContextType = {
    gameState,
    position,
    isWhiteInCheck,
    isBlackInCheck,
    isGameOver,
    gameResult,
    pendingPromotion,
    makeMove,
    newGame,
    undoMove,
  };
  
  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

// Hook
export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};