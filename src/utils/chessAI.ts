// 체스 AI 엔진 - Stockfish 기반 세계 최강 체스 엔진
import { 
  BoardPosition, 
  ChessPiece, 
  PieceType, 
  PieceColor, 
  CastlingRights 
} from '@/types';
import { 
  getStockfishEngine,
  StockfishEngine,
  STOCKFISH_PRESETS,
  StockfishConfig,
  StockfishMove
} from './stockfishEngine';
import { 
  convertAIConfigToStockfish,
  formatStockfishEvaluation 
} from './stockfishConfig';
import { 
  getPossibleMoves, 
  isInCheck, 
  isCheckmate, 
  executeSpecialMove,
  squareToCoordinate 
} from './chessLogic';

// AI 설정 (Stockfish 기반)
export interface AIConfig {
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'master';
  thinkingTime: number; // in seconds
  depth: number;
  randomness: number; // 0-1, 높을수록 랜덤한 선택
  // Stockfish 전용 설정
  skill?: number; // 0-20, Stockfish 기술 수준
  contempt?: number; // -100~100, 무승부 경향
  hash?: number; // MB, 해시 테이블 크기
}

// AI 이동 결과 (Stockfish 향상)
export interface AIMove {
  from: string;
  to: string;
  score: number;
  evaluation: string;
  promotion?: PieceType;
  // Stockfish 전용 추가 정보
  depth?: number;
  pv?: string[]; // 최선 변화수
  confidence?: number; // 0-1, 신뢰도
  engineName?: string; // 'Stockfish' | 'Minimax'
}

// Legacy 기물 가치 테이블 (폴백 전략에서 사용)
const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 0, // 킹은 체크메이트로만 평가
};

// 난이도별 설정 (Stockfish 기반)
export const AI_PRESETS: Record<string, AIConfig> = {
  beginner: {
    difficulty: 'beginner',
    thinkingTime: 1,
    depth: 5,
    randomness: 0.3,
    skill: 3, // Stockfish 초심자 수준
    contempt: 0,
    hash: 16,
  },
  intermediate: {
    difficulty: 'intermediate',
    thinkingTime: 2,
    depth: 8,
    randomness: 0.15,
    skill: 8,
    contempt: 10,
    hash: 32,
  },
  advanced: {
    difficulty: 'advanced',
    thinkingTime: 3,
    depth: 12,
    randomness: 0.05,
    skill: 15,
    contempt: 20,
    hash: 64,
  },
  master: {
    difficulty: 'master',
    thinkingTime: 5,
    depth: 16,
    randomness: 0.01,
    skill: 20, // Stockfish 최고 수준
    contempt: 30,
    hash: 128,
  },
};

// 간단한 평가 함수 (폴백 전략용)
const evaluatePosition = (
  position: BoardPosition,
  currentPlayer: PieceColor
): number => {
  let score = 0;
  
  // 기본 기물 가치 계산
  for (const [square, piece] of Object.entries(position)) {
    if (!piece) continue;
    
    const pieceValue = PIECE_VALUES[piece.type];
    
    if (piece.color === 'white') {
      score += pieceValue;
    } else {
      score -= pieceValue;
    }
  }
  
  // 체크메이트 확인
  if (isCheckmate(position, 'white')) score = -1000;
  if (isCheckmate(position, 'black')) score = 1000;
  
  // 현재 플레이어 관점에서 조정
  return currentPlayer === 'white' ? score : -score;
};

// 모든 가능한 이동 가져오기
const getAllPossibleMoves = (
  position: BoardPosition,
  color: PieceColor,
  castlingRights?: CastlingRights,
  enPassantSquare?: string | null
): Array<{ from: string; to: string; piece: ChessPiece }> => {
  const moves: Array<{ from: string; to: string; piece: ChessPiece }> = [];
  
  for (const [square, piece] of Object.entries(position)) {
    if (!piece || piece.color !== color) continue;
    
    const possibleMoves = getPossibleMoves(
      square,
      position,
      castlingRights || {
        whiteKingSide: true,
        whiteQueenSide: true,
        blackKingSide: true,
        blackQueenSide: true,
      },
      enPassantSquare
    );
    
    possibleMoves.forEach(to => {
      moves.push({ from: square, to, piece });
    });
  }
  
  return moves;
};

// Legacy minimax 알고리즘 제거됨 - Stockfish로 대체

// AI가 최적의 이동을 찾는 메인 함수 (Stockfish 기반)
export const findBestMove = async (
  position: BoardPosition,
  aiColor: PieceColor,
  config: AIConfig,
  castlingRights: CastlingRights,
  enPassantSquare?: string | null,
  moveHistory: string[] = []
): Promise<AIMove | null> => {
  try {
    // Stockfish 엔진 초기화
    const stockfish = await getStockfishEngine();
    
    // AIConfig에서 StockfishConfig로 변환
    const stockfishConfig = convertAIConfigToStockfish(config);
    
    // Stockfish로 최선 수 분석
    const stockfishMove = await stockfish.findBestMove(
      position,
      aiColor,
      stockfishConfig,
      castlingRights,
      enPassantSquare || null,
      moveHistory
    );
    
    if (!stockfishMove) {
      // Stockfish 실패 시 폴백 전략 사용
      console.warn('Stockfish failed, using fallback strategy');
      return await findBestMoveFallback(
        position,
        aiColor,
        config,
        castlingRights,
        enPassantSquare
      );
    }
    
    // 랜덤성 적용 (낮은 난이도에서 가끔 다른 수 선택)
    let finalMove = stockfishMove;
    if (Math.random() < config.randomness && config.randomness > 0.1) {
      // 랜덤성을 위해 skill level 낮춘 설정으로 다시 분석
      const randomConfig = {
        ...stockfishConfig,
        skill: Math.max(0, stockfishConfig.skill - 5),
        depth: Math.max(3, stockfishConfig.depth - 2),
      };
      
      const randomMove = await stockfish.findBestMove(
        position,
        aiColor,
        randomConfig,
        castlingRights,
        enPassantSquare || null,
        moveHistory
      );
      
      if (randomMove && Math.random() < 0.5) {
        finalMove = randomMove;
      }
    }
    
    // AI 결과 형식으로 변환
    const result: AIMove = {
      from: finalMove.from,
      to: finalMove.to,
      promotion: finalMove.promotion,
      score: finalMove.score,
      evaluation: finalMove.evaluation,
      depth: finalMove.depth,
      pv: finalMove.pv,
      confidence: finalMove.confidence,
      engineName: 'Stockfish',
    };
    
    console.log(`Stockfish move: ${result.from}->${result.to}, score: ${result.score.toFixed(2)}, depth: ${result.depth}`);
    return result;
    
  } catch (error) {
    console.error('Stockfish AI error:', error);
    
    // 오류 시 폴백 전략 사용
    console.warn('Falling back to minimax algorithm');
    return await findBestMoveFallback(
      position,
      aiColor,
      config,
      castlingRights,
      enPassantSquare
    );
  }
};

// 폴백 전략: Stockfish 실패 시 사용하는 간단한 전략
const findBestMoveFallback = async (
  position: BoardPosition,
  aiColor: PieceColor,
  config: AIConfig,
  castlingRights: CastlingRights,
  enPassantSquare?: string | null
): Promise<AIMove | null> => {
  try {
    // 가능한 모든 이동 가져오기
    const allMoves = getAllPossibleMoves(position, aiColor, castlingRights, enPassantSquare);
    
    if (allMoves.length === 0) {
      return null;
    }
    
    // 간단한 평가로 최선 수 선택
    let bestMove = allMoves[0];
    let bestScore = -Infinity;
    
    for (const move of allMoves) {
      try {
        const { newPosition } = executeSpecialMove(
          move.from,
          move.to,
          position,
          castlingRights,
          enPassantSquare || null
        );
        
        const score = evaluatePosition(newPosition, aiColor);
        
        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      } catch (error) {
        continue;
      }
    }
    
    // 랜덤성 적용
    if (Math.random() < config.randomness && allMoves.length > 1) {
      const randomIndex = Math.floor(Math.random() * Math.min(3, allMoves.length));
      bestMove = allMoves[randomIndex];
    }
    
    // 평가 설명 생성
    let evaluation = '';
    if (bestScore > 2) {
      evaluation = 'AI가 유리한 상황입니다';
    } else if (bestScore > 0.5) {
      evaluation = 'AI가 약간 유리합니다';
    } else if (bestScore > -0.5) {
      evaluation = '균등한 상황입니다';
    } else if (bestScore > -2) {
      evaluation = '상대방이 약간 유리합니다';
    } else {
      evaluation = '상대방이 유리한 상황입니다';
    }
    
    return {
      from: bestMove.from,
      to: bestMove.to,
      score: bestScore,
      evaluation,
      depth: 1,
      confidence: 0.3, // 낮은 신뢰도
      engineName: 'Fallback',
    };
    
  } catch (error) {
    console.error('Fallback strategy failed:', error);
    return null;
  }
};

// 오프닝 북 (간단한 오프닝 이동들)
export const OPENING_BOOK: Record<string, string[]> = {
  // 킹스 인디언 공격
  '': ['e2e4', 'd2d4', 'g1f3'],
  'e7e5': ['g1f3', 'd2d4', 'f1c4'],
  'e7e6': ['d2d4', 'g1f3', 'e2e4'],
  'c7c5': ['g1f3', 'd2d4', 'e2e4'],
  'd7d5': ['d2d4', 'g1f3', 'c2c4'],
  'g8f6': ['d2d4', 'g1f3', 'c2c4'],
};

// 오프닝 북에서 이동 찾기
export const getOpeningMove = (moveHistory: string[]): string | null => {
  const key = moveHistory.slice(-1)[0] || '';
  const moves = OPENING_BOOK[key];
  
  if (moves && moves.length > 0) {
    return moves[Math.floor(Math.random() * moves.length)];
  }
  
  return null;
};

// Stockfish 엔진 종료 유틸리티
export const cleanupAI = (): void => {
  try {
    // Stockfish 인스턴스 정리
    import('./stockfishEngine').then(({ cleanupStockfish }) => {
      cleanupStockfish();
    });
  } catch (error) {
    console.error('Failed to cleanup AI engine:', error);
  }
};