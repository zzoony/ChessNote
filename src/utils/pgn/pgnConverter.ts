import { ParsedPGNGame } from '@/types/pgn';
import { ChessMove, ChessPiece, PieceColor, BoardPosition } from '@/types/chess';
import { 
  getInitialPosition, 
  executeSpecialMove, 
  generateSAN,
  squareToCoordinate,
  coordinateToSquare,
  getCurrentTurn
} from '@/utils/chessLogic';

/**
 * PGN과 체스 게임 상태 간 변환 유틸리티
 */

// SAN 표기법을 파싱하여 from/to 좌표 찾기
export const parseSANMove = (
  san: string,
  position: BoardPosition,
  currentPlayer: PieceColor
): { from: string; to: string; promotion?: 'queen' | 'rook' | 'bishop' | 'knight' } | null => {
  try {
    // 체크, 체크메이트 표시 제거
    const cleanSAN = san.replace(/[+#!?]+$/, '');
    
    // 캐슬링 처리
    if (cleanSAN === 'O-O') {
      const rank = currentPlayer === 'white' ? '1' : '8';
      return { from: 'e' + rank, to: 'g' + rank };
    }
    if (cleanSAN === 'O-O-O') {
      const rank = currentPlayer === 'white' ? '1' : '8';
      return { from: 'e' + rank, to: 'c' + rank };
    }
    
    // 프로모션 처리
    let promotion: 'queen' | 'rook' | 'bishop' | 'knight' | undefined;
    let workingSAN = cleanSAN;
    const promotionMatch = workingSAN.match(/=([QRBN])$/);
    if (promotionMatch) {
      const promotionPiece = promotionMatch[1];
      promotion = promotionPiece === 'Q' ? 'queen' : 
                 promotionPiece === 'R' ? 'rook' :
                 promotionPiece === 'B' ? 'bishop' : 'knight';
      workingSAN = workingSAN.replace(/=([QRBN])$/, '');
    }
    
    // 기본 이동 파싱
    const movePattern = /^([KQRBN]?)([a-h]?)([1-8]?)(x?)([a-h][1-8])$/;
    const match = workingSAN.match(movePattern);
    
    if (!match) {
      console.warn(`Cannot parse SAN move: ${san}`);
      return null;
    }
    
    const [, pieceType, fromFile, fromRank, isCapture, toSquare] = match;
    
    // 이동하는 기물 타입 결정
    const targetPieceType = pieceType ? 
      (pieceType === 'K' ? 'king' :
       pieceType === 'Q' ? 'queen' :
       pieceType === 'R' ? 'rook' :
       pieceType === 'B' ? 'bishop' :
       pieceType === 'N' ? 'knight' : 'pawn') : 'pawn';
    
    // 가능한 출발점들 찾기
    const candidateSquares: string[] = [];
    
    for (let file = 0; file < 8; file++) {
      for (let rank = 0; rank < 8; rank++) {
        const square = coordinateToSquare(file, rank);
        const piece = position[square];
        
        if (piece && 
            piece.color === currentPlayer && 
            piece.type === targetPieceType) {
          
          // 파일 제약 확인
          if (fromFile && square[0] !== fromFile) continue;
          
          // 랭크 제약 확인  
          if (fromRank && square[1] !== fromRank) continue;
          
          candidateSquares.push(square);
        }
      }
    }
    
    // 실제로 해당 이동이 가능한 출발점 필터링
    const validSquares = candidateSquares.filter(fromSquare => {
      try {
        // 여기서는 간단한 검증만 수행 (실제 게임에서는 더 정교한 검증 필요)
        const piece = position[fromSquare];
        if (!piece) return false;
        
        // 기본적인 이동 가능성 확인
        return isBasicMoveValid(fromSquare, toSquare, piece, position);
      } catch {
        return false;
      }
    });
    
    if (validSquares.length === 1) {
      return { from: validSquares[0], to: toSquare, promotion };
    } else if (validSquares.length > 1) {
      // 모호한 경우 - 첫 번째를 선택 (실제로는 더 정교한 해결 필요)
      console.warn(`Ambiguous move: ${san}, candidates: ${validSquares.join(', ')}`);
      return { from: validSquares[0], to: toSquare, promotion };
    }
    
    console.warn(`No valid square found for move: ${san}`);
    return null;
    
  } catch (error) {
    console.error(`Error parsing SAN move ${san}:`, error);
    return null;
  }
};

// 기본적인 이동 유효성 검사 (체크 검사는 제외)
const isBasicMoveValid = (
  from: string,
  to: string,
  piece: ChessPiece,
  position: BoardPosition
): boolean => {
  const [fromFile, fromRank] = squareToCoordinate(from);
  const [toFile, toRank] = squareToCoordinate(to);
  const fileDistance = Math.abs(toFile - fromFile);
  const rankDistance = Math.abs(toRank - fromRank);
  
  switch (piece.type) {
    case 'pawn':
      const direction = piece.color === 'white' ? 1 : -1;
      const startingRank = piece.color === 'white' ? 1 : 6;
      
      // 전진
      if (fileDistance === 0) {
        if (toRank === fromRank + direction) return !position[to];
        if (fromRank === startingRank && toRank === fromRank + 2 * direction) {
          return !position[to] && !position[coordinateToSquare(fromFile, fromRank + direction)];
        }
      }
      // 대각선 캡처
      if (fileDistance === 1 && toRank === fromRank + direction) {
        return !!position[to];
      }
      return false;
      
    case 'rook':
      return (fileDistance === 0 || rankDistance === 0) && isPathClear(from, to, position);
      
    case 'bishop':
      return fileDistance === rankDistance && isPathClear(from, to, position);
      
    case 'queen':
      return ((fileDistance === 0 || rankDistance === 0) || (fileDistance === rankDistance)) &&
             isPathClear(from, to, position);
      
    case 'knight':
      return (fileDistance === 2 && rankDistance === 1) || (fileDistance === 1 && rankDistance === 2);
      
    case 'king':
      return fileDistance <= 1 && rankDistance <= 1;
      
    default:
      return false;
  }
};

// 경로가 막혀있는지 확인
const isPathClear = (from: string, to: string, position: BoardPosition): boolean => {
  const [fromFile, fromRank] = squareToCoordinate(from);
  const [toFile, toRank] = squareToCoordinate(to);
  
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

// PGN 게임을 ChessMove 배열로 변환
export const convertPGNToMoves = (game: ParsedPGNGame): ChessMove[] => {
  const moves: ChessMove[] = [];
  let position = getInitialPosition();
  let castlingRights = {
    whiteKingSide: true,
    whiteQueenSide: true,
    blackKingSide: true,
    blackQueenSide: true
  };
  let enPassantSquare: string | null = null;
  
  for (let i = 0; i < game.moves.length; i++) {
    try {
      const san = game.moves[i];
      const currentPlayer = getCurrentTurn(i);
      
      // SAN을 from/to 좌표로 변환
      const parsedMove = parseSANMove(san, position, currentPlayer);
      if (!parsedMove) {
        console.error(`Failed to parse move ${i + 1}: ${san}`);
        break;
      }
      
      const { from, to, promotion } = parsedMove;
      const piece = position[from];
      if (!piece) {
        console.error(`No piece at ${from} for move ${san}`);
        break;
      }
      
      // 이동 실행
      const moveResult = executeSpecialMove(
        from, to, position, castlingRights, enPassantSquare, promotion
      );
      
      // ChessMove 객체 생성
      const chessMove: ChessMove = {
        from,
        to,
        piece,
        san,
        fen: '', // FEN은 별도로 생성 필요시 추가
        timestamp: new Date(),
        promotion,
        isCastle: moveResult.moveType === 'castle',
        isEnPassant: moveResult.moveType === 'enpassant',
        capturedPiece: moveResult.capturedPiece
      };
      
      moves.push(chessMove);
      
      // 상태 업데이트
      position = moveResult.newPosition;
      castlingRights = moveResult.newCastlingRights;
      enPassantSquare = moveResult.newEnPassantSquare;
      
    } catch (error) {
      console.error(`Error processing move ${i + 1}: ${game.moves[i]}`, error);
      break;
    }
  }
  
  return moves;
};

// ChessMove 배열을 PGN 형식으로 변환
export const convertMovesToPGN = (moves: ChessMove[]): string => {
  let pgn = '';
  
  for (let i = 0; i < moves.length; i += 2) {
    const moveNumber = Math.floor(i / 2) + 1;
    pgn += `${moveNumber}.`;
    
    if (moves[i]) {
      pgn += ` ${moves[i].san}`;
    }
    
    if (moves[i + 1]) {
      pgn += ` ${moves[i + 1].san}`;
    }
    
    if (i % 10 === 8) { // 줄바꿈
      pgn += '\n';
    } else {
      pgn += ' ';
    }
  }
  
  return pgn.trim();
};

// 특정 이동 인덱스까지의 게임 상태 재구성
export const getGameStateAtMove = (
  game: ParsedPGNGame,
  moveIndex: number
): {
  position: BoardPosition;
  moves: ChessMove[];
  currentPlayer: PieceColor;
} => {
  let position = getInitialPosition();
  const moves: ChessMove[] = [];
  let castlingRights = {
    whiteKingSide: true,
    whiteQueenSide: true,
    blackKingSide: true,
    blackQueenSide: true
  };
  let enPassantSquare: string | null = null;
  
  // moveIndex까지의 이동들을 순차적으로 실행
  const targetMoves = game.moves.slice(0, moveIndex + 1);
  
  for (let i = 0; i < targetMoves.length; i++) {
    const san = targetMoves[i];
    const currentPlayer = getCurrentTurn(i);
    
    const parsedMove = parseSANMove(san, position, currentPlayer);
    if (!parsedMove) break;
    
    const { from, to, promotion } = parsedMove;
    const piece = position[from];
    if (!piece) break;
    
    const moveResult = executeSpecialMove(
      from, to, position, castlingRights, enPassantSquare, promotion
    );
    
    const chessMove: ChessMove = {
      from,
      to,
      piece,
      san,
      fen: '',
      timestamp: new Date(),
      promotion,
      isCastle: moveResult.moveType === 'castle',
      isEnPassant: moveResult.moveType === 'enpassant',
      capturedPiece: moveResult.capturedPiece
    };
    
    moves.push(chessMove);
    position = moveResult.newPosition;
    castlingRights = moveResult.newCastlingRights;
    enPassantSquare = moveResult.newEnPassantSquare;
  }
  
  return {
    position,
    moves,
    currentPlayer: getCurrentTurn(moves.length)
  };
};