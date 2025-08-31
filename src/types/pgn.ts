// PGN 관련 타입 정의

export interface PGNHeaders {
  Event?: string;
  Site?: string;
  Date?: string;
  Round?: string;
  White?: string;
  Black?: string;
  Result?: string;
  ECO?: string;
  Opening?: string;
  Variation?: string;
  [key: string]: string | undefined;
}

export interface ParsedPGNGame {
  headers: PGNHeaders;
  moves: string[];
  result: string;
  comments: { [moveIndex: number]: string };
  variations: { [moveIndex: number]: string[] };
  raw: string;
}

export interface PGNFile {
  id: string;
  name: string;
  content: string;
  games: ParsedPGNGame[];
  createdAt: Date;
  modifiedAt: Date;
  size: number;
}

export interface ReviewGameState {
  pgn: ParsedPGNGame;
  currentMoveIndex: number;
  totalMoves: number;
  isPlaying: boolean;
  playbackSpeed: number; // 0.5x, 1x, 2x, 4x
  showVariations: boolean;
  bookmarks: number[]; // move indices that are bookmarked
}

export type PGNImportSource = 'file' | 'clipboard' | 'text' | 'url';

export interface PGNImportOptions {
  source: PGNImportSource;
  content?: string;
  url?: string;
  validateMoves?: boolean;
  includeVariations?: boolean;
}

export interface PGNParseError {
  type: 'header' | 'move' | 'syntax' | 'validation';
  message: string;
  line?: number;
  column?: number;
}

export interface PGNParseResult {
  success: boolean;
  games: ParsedPGNGame[];
  errors: PGNParseError[];
  warnings: string[];
}