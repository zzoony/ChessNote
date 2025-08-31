// 퍼즐 관련 타입 정의

export interface ChessPuzzle {
  id: string;
  fen: string;
  solution: string[]; // PGN 형식 이동들 (예: ["Nf7", "Qh5+"])
  theme: PuzzleTheme;
  rating: number;
  description: string;
  title?: string;
  tags?: string[];
  source?: string;
  alternativeSolutions?: string[][]; // 여러 정답이 가능한 경우
}

export type PuzzleTheme = 
  | 'fork'
  | 'pin' 
  | 'skewer'
  | 'discovery'
  | 'sacrifice'
  | 'mating_attack'
  | 'endgame'
  | 'opening_trap'
  | 'tactics'
  | 'promotion'
  | 'castling'
  | 'en_passant'
  | 'back_rank_mate'
  | 'smothered_mate';

export interface PuzzleCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  themes: PuzzleTheme[];
  color: string;
  puzzleCount: number;
}

export interface PuzzleProgress {
  puzzleId: string;
  solved: boolean;
  attempts: number;
  solutionTime?: number; // milliseconds
  hintsUsed: number;
  lastAttempt: Date;
  streak: number;
}

export interface PuzzleSession {
  id: string;
  puzzleId: string;
  startTime: Date;
  endTime?: Date;
  moves: string[];
  currentMoveIndex: number;
  hintsUsed: number;
  isCompleted: boolean;
  isCorrect: boolean;
  mistakes: number;
}

export interface PuzzleStats {
  totalPuzzles: number;
  solvedPuzzles: number;
  accuracy: number; // 0-100
  averageTime: number; // milliseconds
  currentStreak: number;
  bestStreak: number;
  ratingGained: number;
  byTheme: Record<PuzzleTheme, {
    solved: number;
    total: number;
    accuracy: number;
  }>;
}

export interface HintLevel {
  level: number;
  type: 'highlight_square' | 'highlight_piece' | 'show_move' | 'show_explanation';
  data: {
    square?: string;
    piece?: string;
    move?: string;
    explanation?: string;
  };
}

export interface PuzzleGameState {
  puzzle: ChessPuzzle;
  session: PuzzleSession;
  solutionIndex: number; // 현재 몇 번째 정답 수에 있는지
  userMoves: string[]; // 사용자가 입력한 수들
  isWaitingForUserMove: boolean;
  hasError: boolean;
  errorMessage?: string;
  showHint: boolean;
  currentHint?: HintLevel;
}