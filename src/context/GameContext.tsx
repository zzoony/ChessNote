import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { GameState, ChessMove, BoardPosition, ChessPiece } from '@/types';
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
  squareToCoordinate,
  getPossibleMoves
} from '@/utils/chessLogic';

// 액션 타입들
type GameAction =
  | { type: 'MAKE_MOVE'; payload: { from: string; to: string; promotion?: 'queen' | 'rook' | 'bishop' | 'knight' } }
  | { type: 'NEW_GAME' }
  | { type: 'UNDO_MOVE' }
  | { type: 'SET_POSITION'; payload: string }
  | { type: 'START_MOVE_ANIMATION'; payload: { moves: AnimatingMove[] } }
  | { type: 'ANIMATION_PIECE_COMPLETE' }
  | { type: 'COMPLETE_MOVE_ANIMATION' }
  | { type: 'SET_SELECTED_SQUARE'; payload: string | null };

// 애니메이션 상태 인터페이스
interface AnimatingMove {
  from: string;
  to: string;
  piece: ChessPiece;
}

interface AnimationState {
  isAnimating: boolean;
  animatingMoves: AnimatingMove[]; // 캐슬링 등 여러 기물이 동시에 이동
  completedAnimations: number;
}

// Context 타입
interface GameContextType {
  gameState: GameState;
  position: BoardPosition;
  selectedSquare: string | null;
  possibleMoves: string[];
  lastMove: { from: string; to: string } | null;
  capturedPieces: { white: ChessPiece[]; black: ChessPiece[] };
  isWhiteInCheck: boolean;
  isBlackInCheck: boolean;
  isGameOver: boolean;
  gameResult: string | null;
  pendingPromotion: { from: string; to: string } | null;
  animationState: AnimationState;
  makeMove: (from: string, to: string, promotion?: 'queen' | 'rook' | 'bishop' | 'knight') => boolean;
  setSelectedSquare: (square: string | null) => void;
  onAnimationComplete: () => void;
  newGame: () => void;
  undoMove: () => void;
}

// 초기 애니메이션 상태
const initialAnimationState: AnimationState = {
  isAnimating: false,
  animatingMoves: [],
  completedAnimations: 0,
};

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

// 추가 상태 인터페이스
interface ExtendedGameState extends GameState {
  selectedSquare: string | null;
  animationState: AnimationState;
}

// 초기 확장 상태
const initialExtendedGameState: ExtendedGameState = {
  ...initialGameState,
  selectedSquare: null,
  animationState: {
    isAnimating: false,
    animatingMoves: [],
    completedAnimations: 0,
  },
};

// Reducer 함수
const gameReducer = (state: ExtendedGameState, action: GameAction): ExtendedGameState => {
  switch (action.type) {
    case 'START_MOVE_ANIMATION': {
      const { moves } = action.payload;
      return {
        ...state,
        animationState: {
          isAnimating: true,
          animatingMoves: moves,
          completedAnimations: 0,
        },
        selectedSquare: null, // 애니메이션 시작 시 선택 해제
      };
    }
    
    case 'ANIMATION_PIECE_COMPLETE': {
      const newCompleted = state.animationState.completedAnimations + 1;
      const allCompleted = newCompleted >= state.animationState.animatingMoves.length;
      
      return {
        ...state,
        animationState: {
          ...state.animationState,
          completedAnimations: newCompleted,
          isAnimating: !allCompleted,
        },
      };
    }
    
    case 'COMPLETE_MOVE_ANIMATION': {
      return {
        ...state,
        animationState: {
          isAnimating: false,
          animatingMoves: [],
          completedAnimations: 0,
        },
      };
    }
    
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
        ...initialExtendedGameState,
        headers: {
          ...initialExtendedGameState.headers,
          Date: new Date().toISOString().split('T')[0],
        },
      };
    
    case 'UNDO_MOVE':
      if (state.moves.length === 0) return state;
      
      const newMoves = state.moves.slice(0, -1);
      
      // 캐슬링 권한을 역계산
      const restoredCastlingRights = calculateCastlingRights(newMoves);
      
      // 앙파상 스퀘어도 역계산
      let restoredEnPassantSquare: string | null = null;
      if (newMoves.length > 0) {
        const lastMove = newMoves[newMoves.length - 1];
        const piece = lastMove.piece;
        
        // 마지막 이동이 폰의 2칸 이동인지 확인
        if (piece.type === 'pawn' && Math.abs(squareToCoordinate(lastMove.to)[1] - squareToCoordinate(lastMove.from)[1]) === 2) {
          const middleRank = piece.color === 'white' ? '3' : '6';
          restoredEnPassantSquare = lastMove.to[0] + middleRank;
        }
      }
      
      return {
        ...state,
        moves: newMoves,
        currentPlayer: getCurrentTurn(newMoves.length),
        castlingRights: restoredCastlingRights,
        enPassantSquare: restoredEnPassantSquare,
        selectedSquare: null, // 실행취소 시 선택 해제
        gameStatus: 'playing', // 게임 상태도 리셋
        headers: {
          ...state.headers,
          Result: '*', // 진행 중으로 복원
        },
      };
    
    case 'SET_SELECTED_SQUARE':
      return {
        ...state,
        selectedSquare: action.payload,
      };
    
    default:
      return state;
  }
};

// 캐슬링 권한 역계산 함수
const calculateCastlingRights = (moves: ChessMove[]) => {
  const rights = {
    whiteKingSide: true,
    whiteQueenSide: true,
    blackKingSide: true,
    blackQueenSide: true,
  };
  
  moves.forEach(move => {
    // 킹이 이동한 경우
    if (move.piece.type === 'king') {
      if (move.piece.color === 'white') {
        rights.whiteKingSide = false;
        rights.whiteQueenSide = false;
      } else {
        rights.blackKingSide = false;
        rights.blackQueenSide = false;
      }
    }
    
    // 룩이 이동한 경우
    if (move.piece.type === 'rook') {
      if (move.from === 'a1') rights.whiteQueenSide = false;
      else if (move.from === 'h1') rights.whiteKingSide = false;
      else if (move.from === 'a8') rights.blackQueenSide = false;
      else if (move.from === 'h8') rights.blackKingSide = false;
    }
    
    // 룩이 잡힌 경우
    if (move.capturedPiece?.type === 'rook') {
      if (move.to === 'a1') rights.whiteQueenSide = false;
      else if (move.to === 'h1') rights.whiteKingSide = false;
      else if (move.to === 'a8') rights.blackQueenSide = false;
      else if (move.to === 'h8') rights.blackKingSide = false;
    }
  });
  
  return rights;
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
  const [gameState, dispatch] = useReducer(gameReducer, initialExtendedGameState);
  const [animationState, setAnimationState] = React.useState<AnimationState>(initialAnimationState);
  const [pendingPromotion, setPendingPromotion] = React.useState<{ from: string; to: string } | null>(null);
  
  const makeMove = (from: string, to: string, promotion?: 'queen' | 'rook' | 'bishop' | 'knight'): boolean => {
    const currentPosition = getCurrentPosition(gameState.moves);
    const piece = currentPosition[from];
    
    if (!piece) return false;
    
    // 프로모션이 필요한 경우
    if (needsPromotion(to, piece) && !promotion) {
      setPendingPromotion({ from, to });
      return false; // 프로모션 선택 대기
    }
    
    setPendingPromotion(null);
    
    // 애니메이션할 기물들 준비
    const animatingMoves: AnimatingMove[] = [];
    
    // 기본 이동
    animatingMoves.push({ from, to, piece });
    
    // 캐슬링인지 확인
    const isCastling = piece.type === 'king' && Math.abs(squareToCoordinate(to)[0] - squareToCoordinate(from)[0]) === 2;
    if (isCastling) {
      const side = squareToCoordinate(to)[0] > squareToCoordinate(from)[0] ? 'king' : 'queen';
      const rank = piece.color === 'white' ? '1' : '8';
      const rookFromSquare = side === 'king' ? 'h' + rank : 'a' + rank;
      const rookToSquare = side === 'king' ? 'f' + rank : 'd' + rank;
      const rook = currentPosition[rookFromSquare];
      
      if (rook) {
        animatingMoves.push({ from: rookFromSquare, to: rookToSquare, piece: rook });
      }
    }
    
    // 애니메이션 시작
    setAnimationState({
      isAnimating: true,
      animatingMoves,
      completedAnimations: 0,
    });
    
    // 애니메이션 완료 후 이동 처리
    const animationDuration = 320; // AnimatedPiece의 최대 지에 시간과 맞춤 (20% 빠르게 조정)
    
    // 비동기로 처리하여 useInsertionEffect 경고 방지
    requestAnimationFrame(() => {
      setTimeout(() => {
        dispatch({ type: 'MAKE_MOVE', payload: { from, to, promotion } });
        
        // 애니메이션 상태 리셋
        setAnimationState(initialAnimationState);
      }, animationDuration + 50);
    });
    
    return true;
  };
  
  const onAnimationComplete = () => {
    setAnimationState(prev => {
      const newCompletedCount = prev.completedAnimations + 1;
      if (newCompletedCount >= prev.animatingMoves.length) {
        // 모든 애니메이션 완료 - 상태는 setTimeout에서 처리
        return prev;
      }
      return {
        ...prev,
        completedAnimations: newCompletedCount,
      };
    });
  };
  
  const newGame = () => {
    setPendingPromotion(null);
    dispatch({ type: 'NEW_GAME' });
  };
  
  const undoMove = () => {
    setPendingPromotion(null);
    dispatch({ type: 'UNDO_MOVE' });
  };
  
  const setSelectedSquare = (square: string | null) => {
    dispatch({ type: 'SET_SELECTED_SQUARE', payload: square });
  };

  // 현재 보드 위치 계산
  const position = getCurrentPosition(gameState.moves);
  
  // 선택된 기물의 가능한 이동 계산
  const possibleMoves = React.useMemo(() => {
    if (!gameState.selectedSquare) return [];
    return getPossibleMoves(
      gameState.selectedSquare,
      position,
      gameState.castlingRights,
      gameState.enPassantSquare
    );
  }, [gameState.selectedSquare, position, gameState.castlingRights, gameState.enPassantSquare]);
  
  // 체크 상태 계산
  const isWhiteInCheck = isInCheck(position, 'white');
  const isBlackInCheck = isInCheck(position, 'black');
  
  // 게임 종료 상태
  const isGameOver = gameState.gameStatus === 'checkmate' || gameState.gameStatus === 'stalemate';
  const gameResult = isGameOver ? gameState.headers.Result : null;
  
  // 마지막 이동 계산
  const lastMove = React.useMemo(() => {
    if (gameState.moves.length === 0) return null;
    const lastMoveData = gameState.moves[gameState.moves.length - 1];
    return { from: lastMoveData.from, to: lastMoveData.to };
  }, [gameState.moves]);

  // 캡처된 기물 계산
  const capturedPieces = React.useMemo(() => {
    const white: ChessPiece[] = [];
    const black: ChessPiece[] = [];
    
    gameState.moves.forEach(move => {
      if (move.capturedPiece) {
        if (move.capturedPiece.color === 'white') {
          white.push(move.capturedPiece);
        } else {
          black.push(move.capturedPiece);
        }
      }
    });
    
    return { white, black };
  }, [gameState.moves]);
  
  const value: GameContextType = {
    gameState,
    position,
    selectedSquare: gameState.selectedSquare,
    possibleMoves,
    lastMove,
    capturedPieces,
    isWhiteInCheck,
    isBlackInCheck,
    isGameOver,
    gameResult,
    pendingPromotion,
    animationState,
    makeMove,
    setSelectedSquare,
    onAnimationComplete,
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