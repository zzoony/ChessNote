// 게임 모드 관련 타입 정의

export type GameMode = 'notation' | 'ai' | 'puzzle' | 'review';

export interface GameModeConfig {
  id: GameMode;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
}

export interface PuzzleData {
  id: string;
  fen: string;
  moves: string[];
  rating: number;
  themes: string[];
  solution: string[];
  description?: string;
}

export interface AIConfig {
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'master';
  thinkingTime: number; // in seconds
  depth?: number;
  elo?: number;
}

export interface ReviewGame {
  id: string;
  pgn: string;
  event?: string;
  date?: string;
  white?: string;
  black?: string;
  result?: string;
  currentMoveIndex: number;
  variations?: string[][];
}