// Stockfish 엔진 통합 - UCI 프로토콜을 통한 세계 최강 체스 엔진
import { 
  BoardPosition, 
  PieceColor, 
  CastlingRights,
  PieceType 
} from '@/types';

// Stockfish WebAssembly 인스턴스 타입
interface StockfishInstance {
  postMessage: (message: string) => void;
  addMessageListener: (callback: (message: string) => void) => void;
  terminate: () => void;
}

// Stockfish 평가 결과
export interface StockfishEvaluation {
  score: number; // 센티폰 단위 (100 = 1폰)
  depth: number;
  nodes: number;
  nps: number; // nodes per second
  time: number; // 계산 시간 (ms)
  pv: string[]; // 최선 변화수 (Principal Variation)
  mate?: number; // 체크메이트까지의 수 (있는 경우)
}

// Stockfish 이동 결과
export interface StockfishMove {
  from: string;
  to: string;
  promotion?: PieceType;
  score: number;
  evaluation: string;
  depth: number;
  pv: string[]; // 최선 변화수
  confidence: number; // 0-1 범위의 신뢰도
}

// Stockfish 엔진 설정
export interface StockfishConfig {
  depth: number; // 탐색 깊이 (1-20)
  skill: number; // 기술 수준 (0-20, 20이 최강)
  time: number; // 시간 제한 (초)
  contempt: number; // 무승부 경향 (-100 ~ 100)
  hash: number; // 해시 테이블 크기 (MB)
  multiPV: number; // 여러 최선수 분석 (1-500)
}

// 난이도별 Stockfish 설정
export const STOCKFISH_PRESETS: Record<string, StockfishConfig> = {
  beginner: {
    depth: 5,
    skill: 3,
    time: 1,
    contempt: 0,
    hash: 16,
    multiPV: 1,
  },
  intermediate: {
    depth: 8,
    skill: 8,
    time: 2,
    contempt: 10,
    hash: 32,
    multiPV: 1,
  },
  advanced: {
    depth: 12,
    skill: 15,
    time: 3,
    contempt: 20,
    hash: 64,
    multiPV: 1,
  },
  master: {
    depth: 16,
    skill: 20,
    time: 5,
    contempt: 30,
    hash: 128,
    multiPV: 1,
  },
  analysis: {
    depth: 20,
    skill: 20,
    time: 10,
    contempt: 0,
    hash: 256,
    multiPV: 3, // 분석 모드에서는 여러 변화수 표시
  },
};

// FEN 변환 유틸리티
const boardPositionToFEN = (
  position: BoardPosition,
  currentPlayer: PieceColor,
  castlingRights: CastlingRights,
  enPassantSquare: string | null,
  halfmoveClock: number = 0,
  fullmoveNumber: number = 1
): string => {
  // 1. 보드 위치를 FEN 형식으로 변환
  let fen = '';
  for (let rank = 7; rank >= 0; rank--) {
    let emptyCount = 0;
    for (let file = 0; file < 8; file++) {
      const square = String.fromCharCode(97 + file) + (rank + 1);
      const piece = position[square];
      
      if (piece) {
        if (emptyCount > 0) {
          fen += emptyCount;
          emptyCount = 0;
        }
        
        let pieceChar = '';
        switch (piece.type) {
          case 'pawn': pieceChar = 'p'; break;
          case 'rook': pieceChar = 'r'; break;
          case 'knight': pieceChar = 'n'; break;
          case 'bishop': pieceChar = 'b'; break;
          case 'queen': pieceChar = 'q'; break;
          case 'king': pieceChar = 'k'; break;
        }
        
        fen += piece.color === 'white' ? pieceChar.toUpperCase() : pieceChar;
      } else {
        emptyCount++;
      }
    }
    
    if (emptyCount > 0) {
      fen += emptyCount;
    }
    
    if (rank > 0) fen += '/';
  }
  
  // 2. 현재 플레이어
  fen += ` ${currentPlayer === 'white' ? 'w' : 'b'}`;
  
  // 3. 캐슬링 권한
  let castling = '';
  if (castlingRights.whiteKingSide) castling += 'K';
  if (castlingRights.whiteQueenSide) castling += 'Q';
  if (castlingRights.blackKingSide) castling += 'k';
  if (castlingRights.blackQueenSide) castling += 'q';
  fen += ` ${castling || '-'}`;
  
  // 4. 앙파상 대상 칸
  fen += ` ${enPassantSquare || '-'}`;
  
  // 5. 하프무브 클럭과 풀무브 번호
  fen += ` ${halfmoveClock} ${fullmoveNumber}`;
  
  return fen;
};

// UCI 이동을 체스 표기법으로 변환
const parseUCIMove = (uciMove: string): { from: string; to: string; promotion?: PieceType } => {
  const from = uciMove.substring(0, 2);
  const to = uciMove.substring(2, 4);
  const promotionChar = uciMove[4];
  
  let promotion: PieceType | undefined;
  if (promotionChar) {
    switch (promotionChar.toLowerCase()) {
      case 'q': promotion = 'queen'; break;
      case 'r': promotion = 'rook'; break;
      case 'b': promotion = 'bishop'; break;
      case 'n': promotion = 'knight'; break;
    }
  }
  
  return { from, to, promotion };
};

// 체스 표기법을 UCI로 변환
const moveToUCI = (from: string, to: string, promotion?: PieceType): string => {
  let uci = from + to;
  if (promotion) {
    const promotionChars: Record<PieceType, string> = {
      queen: 'q',
      rook: 'r',
      bishop: 'b',
      knight: 'n',
      pawn: '', // 폰 프로모션은 불가능
      king: '', // 킹 프로모션은 불가능
    };
    uci += promotionChars[promotion];
  }
  return uci;
};

// Stockfish 엔진 클래스
export class StockfishEngine {
  private stockfish: StockfishInstance | null = null;
  private isReady = false;
  private messageQueue: string[] = [];
  private responseHandlers: Map<string, (response: string[]) => void> = new Map();
  private currentEvaluation: StockfishEvaluation | null = null;
  
  constructor() {
    this.initialize();
  }
  
  private async initialize(): Promise<void> {
    try {
      // Stockfish WebAssembly 로드 (동적 import)
      const Stockfish = await import('stockfish');
      
      // @ts-ignore - Stockfish 모듈의 타입 정의가 불완전할 수 있음
      this.stockfish = new Stockfish.default();
      
      if (this.stockfish) {
        // UCI 프로토콜 초기화
        this.stockfish.addMessageListener((message: string) => {
          this.handleEngineMessage(message);
        });
        
        // UCI 모드 시작
        this.sendCommand('uci');
        this.sendCommand('isready');
      }
    } catch (error) {
      console.error('Failed to initialize Stockfish:', error);
      throw new Error(`Stockfish initialization failed: ${error}`);
    }
  }
  
  private sendCommand(command: string): void {
    if (this.stockfish) {
      console.log(`→ Stockfish: ${command}`);
      this.stockfish.postMessage(command);
    } else {
      this.messageQueue.push(command);
    }
  }
  
  private handleEngineMessage(message: string): void {
    console.log(`← Stockfish: ${message}`);
    
    if (message === 'uciok') {
      console.log('Stockfish UCI initialized');
    } else if (message === 'readyok') {
      this.isReady = true;
      // 대기 중인 명령어 전송
      this.messageQueue.forEach(cmd => this.sendCommand(cmd));
      this.messageQueue = [];
    } else if (message.startsWith('info')) {
      this.parseEvaluationInfo(message);
    } else if (message.startsWith('bestmove')) {
      this.handleBestMove(message);
    }
  }
  
  private parseEvaluationInfo(infoLine: string): void {
    const tokens = infoLine.split(' ');
    let depth = 0;
    let score = 0;
    let nodes = 0;
    let nps = 0;
    let time = 0;
    let pv: string[] = [];
    let mate: number | undefined;
    
    for (let i = 0; i < tokens.length; i++) {
      switch (tokens[i]) {
        case 'depth':
          depth = parseInt(tokens[i + 1]) || 0;
          i++;
          break;
        case 'cp':
          score = parseInt(tokens[i + 1]) || 0;
          i++;
          break;
        case 'mate':
          mate = parseInt(tokens[i + 1]) || 0;
          score = mate > 0 ? 10000 - Math.abs(mate) : -10000 + Math.abs(mate);
          i++;
          break;
        case 'nodes':
          nodes = parseInt(tokens[i + 1]) || 0;
          i++;
          break;
        case 'nps':
          nps = parseInt(tokens[i + 1]) || 0;
          i++;
          break;
        case 'time':
          time = parseInt(tokens[i + 1]) || 0;
          i++;
          break;
        case 'pv':
          pv = tokens.slice(i + 1);
          i = tokens.length; // 나머지는 모두 PV
          break;
      }
    }
    
    if (depth > 0) {
      this.currentEvaluation = {
        score,
        depth,
        nodes,
        nps,
        time,
        pv,
        mate,
      };
    }
  }
  
  private handleBestMove(bestMoveLine: string): void {
    const tokens = bestMoveLine.split(' ');
    const bestMoveUCI = tokens[1];
    
    if (bestMoveUCI && bestMoveUCI !== '(none)') {
      const responseHandler = this.responseHandlers.get('bestmove');
      if (responseHandler) {
        responseHandler([bestMoveUCI]);
        this.responseHandlers.delete('bestmove');
      }
    }
  }
  
  // 엔진 설정 적용
  public applyConfig(config: StockfishConfig): void {
    if (!this.isReady) {
      console.warn('Stockfish not ready, config will be applied when ready');
      return;
    }
    
    this.sendCommand(`setoption name Skill Level value ${config.skill}`);
    this.sendCommand(`setoption name Hash value ${config.hash}`);
    this.sendCommand(`setoption name Contempt value ${config.contempt}`);
    this.sendCommand(`setoption name MultiPV value ${config.multiPV}`);
  }
  
  // 최적 이동 찾기
  public async findBestMove(
    position: BoardPosition,
    currentPlayer: PieceColor,
    config: StockfishConfig,
    castlingRights: CastlingRights,
    enPassantSquare: string | null,
    moveHistory: string[] = []
  ): Promise<StockfishMove | null> {
    if (!this.stockfish || !this.isReady) {
      throw new Error('Stockfish engine not ready');
    }
    
    return new Promise((resolve, reject) => {
      try {
        // 엔진 설정 적용
        this.applyConfig(config);
        
        // 새 게임 시작
        this.sendCommand('ucinewgame');
        
        // 현재 위치 설정
        const fen = boardPositionToFEN(
          position, 
          currentPlayer, 
          castlingRights, 
          enPassantSquare
        );
        
        let positionCommand = `position fen ${fen}`;
        if (moveHistory.length > 0) {
          positionCommand += ` moves ${moveHistory.join(' ')}`;
        }
        
        this.sendCommand(positionCommand);
        
        // 이동 분석 시작
        const searchCommand = config.time > 0 
          ? `go movetime ${config.time * 1000}` // 밀리초로 변환
          : `go depth ${config.depth}`;
        
        this.sendCommand(searchCommand);
        
        // 응답 대기
        this.responseHandlers.set('bestmove', (response: string[]) => {
          const bestMoveUCI = response[0];
          if (!bestMoveUCI || bestMoveUCI === '(none)') {
            resolve(null);
            return;
          }
          
          try {
            const move = parseUCIMove(bestMoveUCI);
            const evaluation = this.currentEvaluation;
            
            // 점수를 폰 단위로 변환
            const scoreInPawns = evaluation ? evaluation.score / 100 : 0;
            
            // 평가 텍스트 생성
            let evaluationText = '';
            if (evaluation?.mate !== undefined) {
              evaluationText = evaluation.mate > 0 
                ? `체크메이트 ${evaluation.mate}수`
                : `체크메이트를 당할 위험 ${Math.abs(evaluation.mate)}수`;
            } else if (scoreInPawns > 3) {
              evaluationText = 'AI가 크게 유리합니다';
            } else if (scoreInPawns > 1) {
              evaluationText = 'AI가 유리합니다';
            } else if (scoreInPawns > 0.5) {
              evaluationText = 'AI가 약간 유리합니다';
            } else if (scoreInPawns > -0.5) {
              evaluationText = '균등한 상황입니다';
            } else if (scoreInPawns > -1) {
              evaluationText = '상대방이 약간 유리합니다';
            } else if (scoreInPawns > -3) {
              evaluationText = '상대방이 유리합니다';
            } else {
              evaluationText = '상대방이 크게 유리합니다';
            }
            
            const result: StockfishMove = {
              from: move.from,
              to: move.to,
              promotion: move.promotion,
              score: scoreInPawns,
              evaluation: evaluationText,
              depth: evaluation?.depth || config.depth,
              pv: evaluation?.pv || [],
              confidence: Math.min(1.0, (evaluation?.depth || 1) / 15), // 깊이 기반 신뢰도
            };
            
            resolve(result);
          } catch (error) {
            reject(new Error(`Failed to parse best move: ${error}`));
          }
        });
        
        // 타임아웃 설정
        setTimeout(() => {
          if (this.responseHandlers.has('bestmove')) {
            this.responseHandlers.delete('bestmove');
            reject(new Error('Stockfish analysis timeout'));
          }
        }, (config.time * 1000) + 5000); // 분석 시간 + 5초 버퍼
        
      } catch (error) {
        reject(error);
      }
    });
  }
  
  // 현재 위치 분석 (평가만)
  public async analyzePosition(
    position: BoardPosition,
    currentPlayer: PieceColor,
    castlingRights: CastlingRights,
    enPassantSquare: string | null,
    depth: number = 15
  ): Promise<StockfishEvaluation | null> {
    if (!this.stockfish || !this.isReady) {
      throw new Error('Stockfish engine not ready');
    }
    
    return new Promise((resolve, reject) => {
      try {
        const fen = boardPositionToFEN(
          position, 
          currentPlayer, 
          castlingRights, 
          enPassantSquare
        );
        
        this.sendCommand(`position fen ${fen}`);
        this.sendCommand(`go depth ${depth}`);
        
        setTimeout(() => {
          resolve(this.currentEvaluation);
        }, 3000); // 3초 후 현재 평가 반환
        
      } catch (error) {
        reject(error);
      }
    });
  }
  
  // 엔진 종료
  public terminate(): void {
    if (this.stockfish) {
      this.sendCommand('quit');
      this.stockfish.terminate();
      this.stockfish = null;
      this.isReady = false;
    }
  }
  
  // 엔진 상태 확인
  public isEngineReady(): boolean {
    return this.isReady;
  }
  
  // 현재 분석 상태 가져오기
  public getCurrentEvaluation(): StockfishEvaluation | null {
    return this.currentEvaluation;
  }
}

// 전역 Stockfish 인스턴스 (싱글톤)
let globalStockfish: StockfishEngine | null = null;

// Stockfish 엔진 인스턴스 가져오기
export const getStockfishEngine = async (): Promise<StockfishEngine> => {
  if (!globalStockfish) {
    globalStockfish = new StockfishEngine();
    
    // 엔진이 준비될 때까지 대기
    let retries = 0;
    while (!globalStockfish.isEngineReady() && retries < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      retries++;
    }
    
    if (!globalStockfish.isEngineReady()) {
      throw new Error('Failed to initialize Stockfish engine');
    }
  }
  
  return globalStockfish;
};

// 엔진 정리
export const cleanupStockfish = (): void => {
  if (globalStockfish) {
    globalStockfish.terminate();
    globalStockfish = null;
  }
};