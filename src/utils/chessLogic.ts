import { ChessPiece, ChessMove, PieceColor, BoardPosition } from '@/types';

// 좌표를 체스 표기법으로 변환 (0,0 -> a1)
export const coordinateToSquare = (file: number, rank: number): string => {
  return String.fromCharCode(97 + file) + (rank + 1);
};

// 체스 표기법을 좌표로 변환 (a1 -> [0,0])
export const squareToCoordinate = (square: string): [number, number] => {
  const file = square.charCodeAt(0) - 97;
  const rank = parseInt(square[1]) - 1;
  return [file, rank];
};

// 기물 이름을 한글로 변환
export const getPieceNameKorean = (piece: ChessPiece): string => {
  const names = {
    king: '왕',
    queen: '퀸', 
    rook: '룩',
    bishop: '비숍',
    knight: '나이트',
    pawn: '폰',
  };
  return names[piece.type];
};

// 간단한 SAN (Standard Algebraic Notation) 생성
export const generateSAN = (
  from: string, 
  to: string, 
  piece: ChessPiece,
  capturedPiece?: ChessPiece | null
): string => {
  let san = '';
  
  // 기물 기호 (폰은 생략)
  if (piece.type !== 'pawn') {
    const pieceSymbols = {
      king: 'K',
      queen: 'Q', 
      rook: 'R',
      bishop: 'B',
      knight: 'N',
      pawn: '',
    };
    san += pieceSymbols[piece.type];
  }
  
  // 캡처 표시
  if (capturedPiece) {
    if (piece.type === 'pawn') {
      san += from[0]; // 폰의 경우 출발 파일 표시
    }
    san += 'x';
  }
  
  // 목적지 표시
  san += to;
  
  return san;
};

// 초기 체스 보드 위치 생성
export const getInitialPosition = (): BoardPosition => {
  const position: BoardPosition = {};
  
  // 빈 칸들 초기화
  for (let rank = 1; rank <= 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const square = String.fromCharCode(97 + file) + rank;
      position[square] = null;
    }
  }
  
  // 백색 기물 배치
  const backRank: Array<ChessPiece['type']> = [
    'rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'
  ];
  
  backRank.forEach((pieceType, index) => {
    const file = String.fromCharCode(97 + index);
    position[file + '1'] = { color: 'white', type: pieceType };
    position[file + '8'] = { color: 'black', type: pieceType };
  });
  
  // 폰 배치
  for (let file = 0; file < 8; file++) {
    const fileChar = String.fromCharCode(97 + file);
    position[fileChar + '2'] = { color: 'white', type: 'pawn' };
    position[fileChar + '7'] = { color: 'black', type: 'pawn' };
  }
  
  return position;
};

// 이동이 유효한지 간단한 검증 (실제로는 더 복잡한 로직 필요)
export const isValidMove = (
  from: string,
  to: string,
  position: BoardPosition
): boolean => {
  const piece = position[from];
  if (!piece) return false;
  
  const [fromFile, fromRank] = squareToCoordinate(from);
  const [toFile, toRank] = squareToCoordinate(to);
  
  // 기본적인 검증만 수행 (같은 색깔 기물 위에 올 수 없음 등)
  const targetPiece = position[to];
  if (targetPiece && targetPiece.color === piece.color) {
    return false;
  }
  
  // 여기서는 모든 이동을 허용 (나중에 실제 체스 규칙 구현)
  return true;
};

// 현재 턴 계산
export const getCurrentTurn = (moveCount: number): PieceColor => {
  return moveCount % 2 === 0 ? 'white' : 'black';
};

// PGN 형식 문자열 생성
export const generatePGN = (moves: ChessMove[]): string => {
  let pgn = '';
  
  for (let i = 0; i < moves.length; i += 2) {
    const moveNumber = Math.floor(i / 2) + 1;
    pgn += `${moveNumber}. `;
    
    if (moves[i]) {
      pgn += moves[i].san + ' ';
    }
    
    if (moves[i + 1]) {
      pgn += moves[i + 1].san + ' ';
    }
    
    pgn += '\n';
  }
  
  return pgn.trim();
};