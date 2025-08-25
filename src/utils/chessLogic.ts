import { ChessPiece, ChessMove, PieceColor, BoardPosition, CastlingRights } from '@/types';

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

// 경로상에 장애물이 있는지 확인 (킹, 나이트 제외)
const isPathClear = (
  fromFile: number, 
  fromRank: number, 
  toFile: number, 
  toRank: number, 
  position: BoardPosition
): boolean => {
  const fileStep = toFile > fromFile ? 1 : toFile < fromFile ? -1 : 0;
  const rankStep = toRank > fromRank ? 1 : toRank < fromRank ? -1 : 0;
  
  let currentFile = fromFile + fileStep;
  let currentRank = fromRank + rankStep;
  
  while (currentFile !== toFile || currentRank !== toRank) {
    const square = coordinateToSquare(currentFile, currentRank);
    if (position[square]) return false;
    
    currentFile += fileStep;
    currentRank += rankStep;
  }
  
  return true;
};

// 각 기물별 유효한 이동 검증
const isValidPieceMove = (
  piece: ChessPiece,
  fromFile: number,
  fromRank: number,
  toFile: number,
  toRank: number,
  position: BoardPosition
): boolean => {
  const fileDistance = Math.abs(toFile - fromFile);
  const rankDistance = Math.abs(toRank - fromRank);
  
  switch (piece.type) {
    case 'pawn':
      const direction = piece.color === 'white' ? 1 : -1;
      const startingRank = piece.color === 'white' ? 1 : 6;
      
      // 앞으로 한 칸 이동
      if (fileDistance === 0 && toRank === fromRank + direction) {
        return !position[coordinateToSquare(toFile, toRank)];
      }
      
      // 처음 위치에서 두 칸 이동
      if (fileDistance === 0 && fromRank === startingRank && toRank === fromRank + 2 * direction) {
        return !position[coordinateToSquare(toFile, toRank)] && 
               !position[coordinateToSquare(toFile, toRank - direction)];
      }
      
      // 대각선 캡처
      if (fileDistance === 1 && toRank === fromRank + direction) {
        return !!position[coordinateToSquare(toFile, toRank)];
      }
      
      return false;
    
    case 'rook':
      return (fileDistance === 0 || rankDistance === 0) && 
             isPathClear(fromFile, fromRank, toFile, toRank, position);
    
    case 'bishop':
      return fileDistance === rankDistance && 
             isPathClear(fromFile, fromRank, toFile, toRank, position);
    
    case 'queen':
      return ((fileDistance === 0 || rankDistance === 0) || (fileDistance === rankDistance)) &&
             isPathClear(fromFile, fromRank, toFile, toRank, position);
    
    case 'knight':
      return (fileDistance === 2 && rankDistance === 1) || 
             (fileDistance === 1 && rankDistance === 2);
    
    case 'king':
      return fileDistance <= 1 && rankDistance <= 1;
    
    default:
      return false;
  }
};

// 이동이 유효한지 검증 (실제 체스 규칙 적용)
export const isValidMove = (
  from: string,
  to: string,
  position: BoardPosition,
  checkForCheck: boolean = true,
  castlingRights?: CastlingRights,
  enPassantSquare?: string | null
): boolean => {
  const piece = position[from];
  if (!piece) return false;
  
  // 같은 위치로 이동할 수 없음
  if (from === to) return false;
  
  const [fromFile, fromRank] = squareToCoordinate(from);
  const [toFile, toRank] = squareToCoordinate(to);
  
  // 보드 범위 검사
  if (toFile < 0 || toFile > 7 || toRank < 0 || toRank > 7) return false;
  
  // 같은 색깔 기물 위에 올 수 없음
  const targetPiece = position[to];
  if (targetPiece && targetPiece.color === piece.color) {
    return false;
  }
  
  // 캐슬링 확인
  if (piece.type === 'king' && Math.abs(toFile - fromFile) === 2 && castlingRights) {
    const side = toFile > fromFile ? 'king' : 'queen';
    return canCastle(position, piece.color, side, castlingRights);
  }
  
  // 앙파상 확인
  if (piece.type === 'pawn' && !targetPiece && Math.abs(toFile - fromFile) === 1) {
    return canEnPassant(from, to, position, enPassantSquare || null);
  }
  
  // 각 기물별 이동 규칙 검증
  if (!isValidPieceMove(piece, fromFile, fromRank, toFile, toRank, position)) {
    return false;
  }
  
  // 이동 후 자신이 체크 상태가 되는지 확인 (무한 재귀 방지용 플래그)
  if (checkForCheck) {
    const tempPosition = { ...position };
    tempPosition[to] = tempPosition[from];
    tempPosition[from] = null;
    
    // 앙파상의 경우 잡힌 폰도 제거
    if (piece.type === 'pawn' && enPassantSquare && to === enPassantSquare) {
      const captureRank = piece.color === 'white' ? '5' : '4';
      const captureSquare = to[0] + captureRank;
      tempPosition[captureSquare] = null;
    }
    
    if (isInCheck(tempPosition, piece.color)) {
      return false;
    }
  }
  
  return true;
};

// 킹의 위치 찾기
const findKing = (position: BoardPosition, color: PieceColor): string | null => {
  for (const square in position) {
    const piece = position[square];
    if (piece && piece.color === color && piece.type === 'king') {
      return square;
    }
  }
  return null;
};

// 특정 색깔이 특정 칸을 공격하고 있는지 확인
const isSquareUnderAttack = (
  square: string, 
  attackingColor: PieceColor, 
  position: BoardPosition
): boolean => {
  for (const fromSquare in position) {
    const piece = position[fromSquare];
    if (piece && piece.color === attackingColor && fromSquare !== square) {
      // 폰의 경우 특별 처리 (공격 방향이 이동 방향과 다름)
      if (piece.type === 'pawn') {
        const [fromFile, fromRank] = squareToCoordinate(fromSquare);
        const [toFile, toRank] = squareToCoordinate(square);
        const direction = piece.color === 'white' ? 1 : -1;
        
        if (Math.abs(toFile - fromFile) === 1 && toRank === fromRank + direction) {
          return true;
        }
      } else {
        // 다른 기물들은 일반 이동 규칙으로 공격 가능성 확인 (체크 검사 비활성화로 무한 재귀 방지)
        if (isValidMove(fromSquare, square, position, false)) {
          return true;
        }
      }
    }
  }
  return false;
};

// 체크 상태 확인
export const isInCheck = (position: BoardPosition, color: PieceColor): boolean => {
  const kingSquare = findKing(position, color);
  if (!kingSquare) return false;
  
  const enemyColor = color === 'white' ? 'black' : 'white';
  return isSquareUnderAttack(kingSquare, enemyColor, position);
};

// 가능한 모든 합법적 이동 찾기
const getAllLegalMoves = (position: BoardPosition, color: PieceColor): Array<{from: string, to: string}> => {
  const legalMoves: Array<{from: string, to: string}> = [];
  
  for (const fromSquare in position) {
    const piece = position[fromSquare];
    if (piece && piece.color === color) {
      // 각 칸에 대해 이동 가능성 확인
      for (let file = 0; file < 8; file++) {
        for (let rank = 0; rank < 8; rank++) {
          const toSquare = coordinateToSquare(file, rank);
          // 체크 검사는 이후에 수행하므로 여기서는 비활성화
          if (isValidMove(fromSquare, toSquare, position, false)) {
            // 이동 후 자신이 체크 상태가 되지 않는지 확인
            const tempPosition = { ...position };
            tempPosition[toSquare] = tempPosition[fromSquare];
            tempPosition[fromSquare] = null;
            
            if (!isInCheck(tempPosition, color)) {
              legalMoves.push({ from: fromSquare, to: toSquare });
            }
          }
        }
      }
    }
  }
  
  return legalMoves;
};

// 체크메이트 상태 확인
export const isCheckmate = (position: BoardPosition, color: PieceColor): boolean => {
  return isInCheck(position, color) && getAllLegalMoves(position, color).length === 0;
};

// 스테일메이트 상태 확인 (체크가 아닌데 합법적 이동이 없음)
export const isStalemate = (position: BoardPosition, color: PieceColor): boolean => {
  return !isInCheck(position, color) && getAllLegalMoves(position, color).length === 0;
};

// 캐슬링이 가능한지 확인
export const canCastle = (
  position: BoardPosition,
  color: PieceColor,
  side: 'king' | 'queen',
  castlingRights: CastlingRights
): boolean => {
  const rank = color === 'white' ? '1' : '8';
  const kingSquare = 'e' + rank;
  const rookSquare = side === 'king' ? 'h' + rank : 'a' + rank;
  
  // 캐슬링 권한 확인
  const rightKey = `${color}${side === 'king' ? 'King' : 'Queen'}Side` as keyof CastlingRights;
  if (!castlingRights[rightKey]) return false;
  
  // 킹과 룩이 제자리에 있는지 확인
  const king = position[kingSquare];
  const rook = position[rookSquare];
  if (!king || king.type !== 'king' || king.color !== color) return false;
  if (!rook || rook.type !== 'rook' || rook.color !== color) return false;
  
  // 킹이 체크 상태가 아닌지 확인
  if (isInCheck(position, color)) return false;
  
  // 킹과 룩 사이가 비어있는지 확인
  const files = side === 'king' ? ['f', 'g'] : ['d', 'c', 'b'];
  for (const file of files) {
    if (file === 'b' && side === 'queen') continue; // b1/b8은 룩 통과만 확인
    const square = file + rank;
    if (position[square]) return false;
  }
  
  // 킹이 지나는 칸이 공격받지 않는지 확인
  const kingPath = side === 'king' ? ['f' + rank, 'g' + rank] : ['d' + rank, 'c' + rank];
  const enemyColor = color === 'white' ? 'black' : 'white';
  
  for (const square of kingPath) {
    if (isSquareUnderAttack(square, enemyColor, position)) return false;
  }
  
  return true;
};

// 앙파상이 가능한지 확인
export const canEnPassant = (
  from: string,
  to: string,
  position: BoardPosition,
  enPassantSquare: string | null
): boolean => {
  if (!enPassantSquare || to !== enPassantSquare) return false;
  
  const piece = position[from];
  if (!piece || piece.type !== 'pawn') return false;
  
  const [fromFile, fromRank] = squareToCoordinate(from);
  const [toFile, toRank] = squareToCoordinate(to);
  
  // 폰이 대각선으로 한 칸 이동하는지 확인
  if (Math.abs(toFile - fromFile) !== 1) return false;
  
  const direction = piece.color === 'white' ? 1 : -1;
  if (toRank !== fromRank + direction) return false;
  
  return true;
};

// 폰 프로모션 확인
export const needsPromotion = (to: string, piece: ChessPiece): boolean => {
  if (piece.type !== 'pawn') return false;
  
  const [, toRank] = squareToCoordinate(to);
  return (piece.color === 'white' && toRank === 7) || 
         (piece.color === 'black' && toRank === 0);
};

// 특수 이동을 포함한 이동 실행
export const executeSpecialMove = (
  from: string,
  to: string,
  position: BoardPosition,
  castlingRights: CastlingRights,
  enPassantSquare: string | null,
  promotion?: PieceColor extends 'white' ? 'queen' | 'rook' | 'bishop' | 'knight' : 'queen' | 'rook' | 'bishop' | 'knight'
): {
  newPosition: BoardPosition;
  newCastlingRights: CastlingRights;
  newEnPassantSquare: string | null;
  moveType: 'normal' | 'castle' | 'enpassant' | 'promotion';
  capturedPiece?: ChessPiece;
} => {
  const newPosition = { ...position };
  const newCastlingRights = { ...castlingRights };
  let newEnPassantSquare: string | null = null;
  let moveType: 'normal' | 'castle' | 'enpassant' | 'promotion' = 'normal';
  let capturedPiece: ChessPiece | undefined;
  
  const piece = position[from];
  if (!piece) throw new Error('No piece at from square');
  
  // 캐슬링 확인
  if (piece.type === 'king' && Math.abs(squareToCoordinate(to)[0] - squareToCoordinate(from)[0]) === 2) {
    const side = squareToCoordinate(to)[0] > squareToCoordinate(from)[0] ? 'king' : 'queen';
    const rank = piece.color === 'white' ? '1' : '8';
    const rookFromSquare = side === 'king' ? 'h' + rank : 'a' + rank;
    const rookToSquare = side === 'king' ? 'f' + rank : 'd' + rank;
    
    // 킹 이동
    newPosition[to] = piece;
    newPosition[from] = null;
    
    // 룩 이동
    newPosition[rookToSquare] = position[rookFromSquare];
    newPosition[rookFromSquare] = null;
    
    moveType = 'castle';
  }
  // 앙파상 확인
  else if (piece.type === 'pawn' && canEnPassant(from, to, position, enPassantSquare)) {
    const captureRank = piece.color === 'white' ? '5' : '4';
    const captureSquare = to[0] + captureRank;
    
    capturedPiece = position[captureSquare] || undefined;
    newPosition[to] = piece;
    newPosition[from] = null;
    newPosition[captureSquare] = null;
    
    moveType = 'enpassant';
  }
  // 일반 이동
  else {
    capturedPiece = position[to] || undefined;
    
    // 폰 프로모션 확인
    if (needsPromotion(to, piece)) {
      const promotedPiece: ChessPiece = {
        color: piece.color,
        type: promotion || 'queen'
      };
      newPosition[to] = promotedPiece;
      moveType = 'promotion';
    } else {
      newPosition[to] = piece;
    }
    
    newPosition[from] = null;
  }
  
  // 2칸 이동하는 폰의 앙파상 타겟 설정
  if (piece.type === 'pawn' && Math.abs(squareToCoordinate(to)[1] - squareToCoordinate(from)[1]) === 2) {
    const middleRank = piece.color === 'white' ? '3' : '6';
    newEnPassantSquare = to[0] + middleRank;
  }
  
  // 캐슬링 권한 업데이트
  if (piece.type === 'king') {
    if (piece.color === 'white') {
      newCastlingRights.whiteKingSide = false;
      newCastlingRights.whiteQueenSide = false;
    } else {
      newCastlingRights.blackKingSide = false;
      newCastlingRights.blackQueenSide = false;
    }
  } else if (piece.type === 'rook') {
    if (from === 'a1') newCastlingRights.whiteQueenSide = false;
    else if (from === 'h1') newCastlingRights.whiteKingSide = false;
    else if (from === 'a8') newCastlingRights.blackQueenSide = false;
    else if (from === 'h8') newCastlingRights.blackKingSide = false;
  }
  
  // 룩이 잡힌 경우 캐슬링 권한 제거
  if (capturedPiece && capturedPiece.type === 'rook') {
    if (to === 'a1') newCastlingRights.whiteQueenSide = false;
    else if (to === 'h1') newCastlingRights.whiteKingSide = false;
    else if (to === 'a8') newCastlingRights.blackQueenSide = false;
    else if (to === 'h8') newCastlingRights.blackKingSide = false;
  }
  
  return {
    newPosition,
    newCastlingRights,
    newEnPassantSquare,
    moveType,
    capturedPiece
  };
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