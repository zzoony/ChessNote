import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { GameState, ChessMove, BoardPosition } from '@/types';
import { 
  getInitialPosition, 
  generateSAN, 
  isValidMove, 
  getCurrentTurn 
} from '@/utils/chessLogic';

// 액션 타입들
type GameAction =
  | { type: 'MAKE_MOVE'; payload: { from: string; to: string } }
  | { type: 'NEW_GAME' }
  | { type: 'UNDO_MOVE' }
  | { type: 'SET_POSITION'; payload: string };

// Context 타입
interface GameContextType {
  gameState: GameState;
  position: BoardPosition;
  makeMove: (from: string, to: string) => boolean;
  newGame: () => void;
  undoMove: () => void;
}

// 초기 상태
const initialGameState: GameState = {
  position: '', // FEN 형식 (나중에 구현)
  moves: [],
  currentPlayer: 'white',
  gameStatus: 'playing',
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
      const { from, to } = action.payload;
      
      // 현재 보드 위치 재구성 (간단한 구현)
      const currentPosition = getCurrentPosition(state.moves);
      
      if (!isValidMove(from, to, currentPosition)) {
        return state; // 무효한 이동
      }
      
      const piece = currentPosition[from];
      if (!piece) return state;
      
      const capturedPiece = currentPosition[to];
      const san = generateSAN(from, to, piece, capturedPiece);
      
      const newMove: ChessMove = {
        from,
        to,
        piece,
        san,
        fen: '', // 나중에 FEN 구현
        timestamp: new Date(),
      };
      
      const newMoves = [...state.moves, newMove];
      
      return {
        ...state,
        moves: newMoves,
        currentPlayer: getCurrentTurn(newMoves.length),
      };
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
    position[move.to] = position[move.from];
    position[move.from] = null;
  });
  
  return position;
};

// Context 생성
const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider 컴포넌트
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  
  const makeMove = (from: string, to: string): boolean => {
    dispatch({ type: 'MAKE_MOVE', payload: { from, to } });
    return true; // 실제로는 성공/실패 여부 반환
  };
  
  const newGame = () => {
    dispatch({ type: 'NEW_GAME' });
  };
  
  const undoMove = () => {
    dispatch({ type: 'UNDO_MOVE' });
  };
  
  // 현재 보드 위치 계산
  const position = getCurrentPosition(gameState.moves);
  
  const value: GameContextType = {
    gameState,
    position,
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