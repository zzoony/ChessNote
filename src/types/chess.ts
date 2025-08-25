// 체스 게임 관련 타입 정의

export type PieceColor = 'white' | 'black';
export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
export type Square = string; // 'a1', 'b2' 등

export interface ChessPiece {
  color: PieceColor;
  type: PieceType;
}

export interface ChessMove {
  from: Square;
  to: Square;
  piece: ChessPiece;
  san: string; // Standard Algebraic Notation (e4, Nf3 등)
  fen: string; // 이동 후 위치
  timestamp: Date;
  promotion?: PieceType;
  isCastle?: boolean;
  isEnPassant?: boolean;
  capturedPiece?: ChessPiece;
}

export interface CastlingRights {
  whiteKingSide: boolean;
  whiteQueenSide: boolean;
  blackKingSide: boolean;
  blackQueenSide: boolean;
}

export interface GameState {
  position: string; // FEN 형식
  moves: ChessMove[];
  currentPlayer: PieceColor;
  gameStatus: 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw';
  castlingRights: CastlingRights;
  enPassantSquare: string | null;
  headers: {
    Event?: string;
    Site?: string;
    Date: string;
    White: string;
    Black: string;
    Result: string;
  };
}

export interface BoardPosition {
  [square: string]: ChessPiece | null;
}

// PGN 관련
export interface PGNGame {
  headers: { [key: string]: string };
  moves: string[];
  result: string;
}