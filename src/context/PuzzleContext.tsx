import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  ChessPuzzle, 
  PuzzleGameState, 
  PuzzleSession, 
  PuzzleProgress, 
  PuzzleStats,
  HintLevel,
  BoardPosition,
  ChessMove
} from '@/types';
import { 
  parseFEN, 
  isValidMove, 
  generateSANFromPosition, 
  applyMove,
  getCurrentTurnFromPosition,
  isCheckmate,
  isStalemate,
  getPossibleMovesForPosition
} from '@/utils/chessLogic';
import { getPuzzleById } from '@/data/puzzles';

// 액션 타입들
type PuzzleAction =
  | { type: 'LOAD_PUZZLE'; payload: ChessPuzzle }
  | { type: 'MAKE_MOVE'; payload: { from: string; to: string; promotion?: 'queen' | 'rook' | 'bishop' | 'knight' } }
  | { type: 'RESET_PUZZLE' }
  | { type: 'SHOW_HINT'; payload: HintLevel }
  | { type: 'HIDE_HINT' }
  | { type: 'COMPLETE_PUZZLE'; payload: { isCorrect: boolean; timeSpent: number } }
  | { type: 'LOAD_PROGRESS'; payload: Record<string, PuzzleProgress> }
  | { type: 'LOAD_STATS'; payload: PuzzleStats }
  | { type: 'INCREMENT_MISTAKE' }
  | { type: 'USE_HINT' };

// Context 타입
interface PuzzleContextType {
  // 현재 퍼즐 상태
  puzzleGameState: PuzzleGameState | null;
  position: BoardPosition;
  possibleMoves: string[];
  selectedSquare: string | null;
  
  // 진행 상황
  puzzleProgress: Record<string, PuzzleProgress>;
  puzzleStats: PuzzleStats;
  
  // 액션들
  loadPuzzle: (puzzle: ChessPuzzle) => void;
  makeMove: (from: string, to: string, promotion?: 'queen' | 'rook' | 'bishop' | 'knight') => void;
  resetPuzzle: () => void;
  showHint: () => void;
  hideHint: () => void;
  setSelectedSquare: (square: string | null) => void;
  
  // 진행 상황 관리
  markPuzzleCompleted: (puzzleId: string, success: boolean, timeSpent: number, hintsUsed: number) => Promise<void>;
  getPuzzleProgress: (puzzleId: string) => PuzzleProgress | null;
  loadProgress: () => Promise<void>;
}

// 초기 상태
const initialPuzzleStats: PuzzleStats = {
  totalPuzzles: 0,
  solvedPuzzles: 0,
  accuracy: 0,
  averageTime: 0,
  currentStreak: 0,
  bestStreak: 0,
  ratingGained: 0,
  byTheme: {
    fork: { solved: 0, total: 0, accuracy: 0 },
    pin: { solved: 0, total: 0, accuracy: 0 },
    skewer: { solved: 0, total: 0, accuracy: 0 },
    discovery: { solved: 0, total: 0, accuracy: 0 },
    sacrifice: { solved: 0, total: 0, accuracy: 0 },
    mating_attack: { solved: 0, total: 0, accuracy: 0 },
    endgame: { solved: 0, total: 0, accuracy: 0 },
    opening_trap: { solved: 0, total: 0, accuracy: 0 },
    tactics: { solved: 0, total: 0, accuracy: 0 },
    promotion: { solved: 0, total: 0, accuracy: 0 },
    castling: { solved: 0, total: 0, accuracy: 0 },
    en_passant: { solved: 0, total: 0, accuracy: 0 },
    back_rank_mate: { solved: 0, total: 0, accuracy: 0 },
    smothered_mate: { solved: 0, total: 0, accuracy: 0 }
  }
};

// Context 생성
const PuzzleContext = createContext<PuzzleContextType | null>(null);

// Reducer
const puzzleReducer = (state: any, action: PuzzleAction): any => {
  switch (action.type) {
    case 'LOAD_PUZZLE': {
      const puzzle = action.payload;
      const position = parseFEN(puzzle.fen);
      const session: PuzzleSession = {
        id: `session_${Date.now()}`,
        puzzleId: puzzle.id,
        startTime: new Date(),
        moves: [],
        currentMoveIndex: 0,
        hintsUsed: 0,
        isCompleted: false,
        isCorrect: false,
        mistakes: 0
      };

      const puzzleGameState: PuzzleGameState = {
        puzzle,
        session,
        solutionIndex: 0,
        userMoves: [],
        isWaitingForUserMove: true,
        hasError: false,
        showHint: false
      };

      return {
        ...state,
        puzzleGameState,
        position,
        possibleMoves: getPossibleMovesForPosition(position, getCurrentTurnFromPosition(position)),
        selectedSquare: null
      };
    }

    case 'MAKE_MOVE': {
      if (!state.puzzleGameState) return state;

      const { from, to, promotion } = action.payload;
      const { puzzle, session, solutionIndex, userMoves } = state.puzzleGameState;

      // 이동 유효성 검사
      if (!isValidMove(from, to, state.position, true)) {
        return {
          ...state,
          puzzleGameState: {
            ...state.puzzleGameState,
            hasError: true,
            errorMessage: '유효하지 않은 이동입니다.'
          }
        };
      }

      // 이동 적용
      const newPosition = applyMove(state.position, from, to, promotion);
      const moveNotation = generateSANFromPosition(state.position, from, to, promotion);
      const newUserMoves = [...userMoves, moveNotation];

      // 정답 확인
      const expectedMove = puzzle.solution[solutionIndex];
      const isCorrectMove = moveNotation === expectedMove;

      if (!isCorrectMove) {
        // 틀린 수
        return {
          ...state,
          puzzleGameState: {
            ...state.puzzleGameState,
            hasError: true,
            errorMessage: '틀렸습니다! 다시 시도해보세요.',
            session: {
              ...session,
              mistakes: session.mistakes + 1
            }
          }
        };
      }

      // 맞은 수 - 다음 수로 진행
      const newSolutionIndex = solutionIndex + 1;
      const isCompleted = newSolutionIndex >= puzzle.solution.length;

      const updatedSession: PuzzleSession = {
        ...session,
        moves: [...session.moves, moveNotation],
        currentMoveIndex: newSolutionIndex,
        isCompleted,
        isCorrect: isCompleted,
        endTime: isCompleted ? new Date() : undefined
      };

      return {
        ...state,
        position: newPosition,
        possibleMoves: getPossibleMovesForPosition(newPosition, getCurrentTurnFromPosition(newPosition)),
        selectedSquare: null,
        puzzleGameState: {
          ...state.puzzleGameState,
          session: updatedSession,
          solutionIndex: newSolutionIndex,
          userMoves: newUserMoves,
          isWaitingForUserMove: !isCompleted,
          hasError: false,
          errorMessage: undefined
        }
      };
    }

    case 'RESET_PUZZLE': {
      if (!state.puzzleGameState) return state;
      
      const { puzzle } = state.puzzleGameState;
      const position = parseFEN(puzzle.fen);
      
      return {
        ...state,
        position,
        possibleMoves: getPossibleMovesForPosition(position, getCurrentTurnFromPosition(position)),
        selectedSquare: null,
        puzzleGameState: {
          ...state.puzzleGameState,
          solutionIndex: 0,
          userMoves: [],
          isWaitingForUserMove: true,
          hasError: false,
          errorMessage: undefined,
          showHint: false,
          currentHint: undefined,
          session: {
            ...state.puzzleGameState.session,
            moves: [],
            currentMoveIndex: 0,
            mistakes: 0,
            isCompleted: false,
            isCorrect: false
          }
        }
      };
    }

    case 'SHOW_HINT': {
      if (!state.puzzleGameState) return state;

      return {
        ...state,
        puzzleGameState: {
          ...state.puzzleGameState,
          showHint: true,
          currentHint: action.payload,
          session: {
            ...state.puzzleGameState.session,
            hintsUsed: state.puzzleGameState.session.hintsUsed + 1
          }
        }
      };
    }

    case 'HIDE_HINT': {
      if (!state.puzzleGameState) return state;

      return {
        ...state,
        puzzleGameState: {
          ...state.puzzleGameState,
          showHint: false,
          currentHint: undefined
        }
      };
    }

    case 'LOAD_PROGRESS': {
      return {
        ...state,
        puzzleProgress: action.payload
      };
    }

    case 'LOAD_STATS': {
      return {
        ...state,
        puzzleStats: action.payload
      };
    }

    default:
      return state;
  }
};

// Provider 컴포넌트
export const PuzzleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(puzzleReducer, {
    puzzleGameState: null,
    position: {},
    possibleMoves: [],
    selectedSquare: null,
    puzzleProgress: {},
    puzzleStats: initialPuzzleStats
  });

  // AsyncStorage 키들
  const STORAGE_KEYS = {
    PUZZLE_PROGRESS: '@puzzle_progress',
    PUZZLE_STATS: '@puzzle_stats'
  };

  // 퍼즐 로드
  const loadPuzzle = (puzzle: ChessPuzzle) => {
    dispatch({ type: 'LOAD_PUZZLE', payload: puzzle });
  };

  // 이동하기
  const makeMove = (from: string, to: string, promotion?: 'queen' | 'rook' | 'bishop' | 'knight') => {
    dispatch({ type: 'MAKE_MOVE', payload: { from, to, promotion } });
  };

  // 퍼즐 재시작
  const resetPuzzle = () => {
    dispatch({ type: 'RESET_PUZZLE' });
  };

  // 힌트 생성
  const generateHint = (puzzle: ChessPuzzle, solutionIndex: number, hintLevel: number): HintLevel => {
    const solution = puzzle.solution[solutionIndex];
    if (!solution) {
      return { level: 1, type: 'show_explanation', data: { explanation: '이미 완성된 퍼즐입니다.' } };
    }

    // 간단한 힌트 시스템 (실제로는 더 정교한 분석이 필요)
    switch (hintLevel) {
      case 1:
        return { 
          level: 1, 
          type: 'show_explanation', 
          data: { explanation: `${puzzle.theme} 패턴을 찾아보세요.` }
        };
      case 2:
        // 첫 번째 글자를 힌트로 제공
        const firstChar = solution.charAt(0);
        return { 
          level: 2, 
          type: 'show_explanation', 
          data: { explanation: `${firstChar}로 시작하는 수를 찾아보세요.` }
        };
      case 3:
        return { 
          level: 3, 
          type: 'show_move', 
          data: { move: solution }
        };
      default:
        return { level: 1, type: 'show_explanation', data: { explanation: '힌트를 사용하세요.' } };
    }
  };

  // 힌트 표시
  const showHint = () => {
    if (!state.puzzleGameState) return;

    const { puzzle, solutionIndex, session } = state.puzzleGameState;
    const hintLevel = session.hintsUsed + 1;
    const hint = generateHint(puzzle, solutionIndex, hintLevel);
    
    dispatch({ type: 'SHOW_HINT', payload: hint });
  };

  // 힌트 숨기기
  const hideHint = () => {
    dispatch({ type: 'HIDE_HINT' });
  };

  // 선택된 칸 설정
  const setSelectedSquare = (square: string | null) => {
    // 여기서는 간단히 상태만 업데이트 (실제로는 reducer에 추가 필요)
  };

  // 퍼즐 완료 처리
  const markPuzzleCompleted = async (
    puzzleId: string, 
    success: boolean, 
    timeSpent: number, 
    hintsUsed: number
  ) => {
    try {
      // 기존 진행상황 로드
      const existingProgressStr = await AsyncStorage.getItem(STORAGE_KEYS.PUZZLE_PROGRESS);
      const existingProgress = existingProgressStr ? JSON.parse(existingProgressStr) : {};

      // 새로운 진행상황 생성
      const newProgress: PuzzleProgress = {
        puzzleId,
        solved: success,
        attempts: (existingProgress[puzzleId]?.attempts || 0) + 1,
        solutionTime: success ? timeSpent : undefined,
        hintsUsed,
        lastAttempt: new Date(),
        streak: success ? (existingProgress[puzzleId]?.streak || 0) + 1 : 0
      };

      // 진행상황 업데이트
      const updatedProgress = {
        ...existingProgress,
        [puzzleId]: newProgress
      };

      // 저장
      await AsyncStorage.setItem(STORAGE_KEYS.PUZZLE_PROGRESS, JSON.stringify(updatedProgress));
      dispatch({ type: 'LOAD_PROGRESS', payload: updatedProgress });

      // 통계 업데이트
      await updateStats(updatedProgress);
    } catch (error) {
      console.error('Error saving puzzle progress:', error);
    }
  };

  // 퍼즐 진행상황 가져오기
  const getPuzzleProgress = (puzzleId: string): PuzzleProgress | null => {
    return state.puzzleProgress[puzzleId] || null;
  };

  // 진행상황 로드
  const loadProgress = async () => {
    try {
      const progressStr = await AsyncStorage.getItem(STORAGE_KEYS.PUZZLE_PROGRESS);
      const progress = progressStr ? JSON.parse(progressStr) : {};
      dispatch({ type: 'LOAD_PROGRESS', payload: progress });

      const statsStr = await AsyncStorage.getItem(STORAGE_KEYS.PUZZLE_STATS);
      const stats = statsStr ? JSON.parse(statsStr) : initialPuzzleStats;
      dispatch({ type: 'LOAD_STATS', payload: stats });
    } catch (error) {
      console.error('Error loading puzzle progress:', error);
    }
  };

  // 통계 업데이트
  const updateStats = async (progress: Record<string, PuzzleProgress>) => {
    try {
      // 통계 계산 로직
      const solved = Object.values(progress).filter(p => p.solved).length;
      const total = Object.keys(progress).length;
      const accuracy = total > 0 ? (solved / total) * 100 : 0;

      // 더 정교한 통계 계산 필요...
      const newStats: PuzzleStats = {
        ...state.puzzleStats,
        totalPuzzles: total,
        solvedPuzzles: solved,
        accuracy
      };

      await AsyncStorage.setItem(STORAGE_KEYS.PUZZLE_STATS, JSON.stringify(newStats));
      dispatch({ type: 'LOAD_STATS', payload: newStats });
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  };

  // 초기 로드
  useEffect(() => {
    loadProgress();
  }, []);

  const contextValue: PuzzleContextType = {
    puzzleGameState: state.puzzleGameState,
    position: state.position,
    possibleMoves: state.possibleMoves,
    selectedSquare: state.selectedSquare,
    puzzleProgress: state.puzzleProgress,
    puzzleStats: state.puzzleStats,
    loadPuzzle,
    makeMove,
    resetPuzzle,
    showHint,
    hideHint,
    setSelectedSquare,
    markPuzzleCompleted,
    getPuzzleProgress,
    loadProgress
  };

  return (
    <PuzzleContext.Provider value={contextValue}>
      {children}
    </PuzzleContext.Provider>
  );
};

// Hook
export const usePuzzle = (): PuzzleContextType => {
  const context = useContext(PuzzleContext);
  if (!context) {
    throw new Error('usePuzzle must be used within a PuzzleProvider');
  }
  return context;
};