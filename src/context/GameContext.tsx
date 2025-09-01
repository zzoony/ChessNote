import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { GameState, ChessMove, BoardPosition, ChessPiece } from '@/types';
import { 
  getInitialPosition, 
  generateSAN, 
  isValidMove, 
  getCurrentTurn,
  isInCheck,
  isCheckmate,
  isStalemate,
  executeSpecialMove,
  needsPromotion,
  squareToCoordinate,
  getPossibleMoves
} from '@/utils/chessLogic';
import { GameTreeNode, ParsedGame } from '@/utils/pgnParser';

// 게임 모드 타입
export type GameMode = 'live' | 'analysis';

// 액션 타입들
type GameAction =
  | { type: 'MAKE_MOVE'; payload: { from: string; to: string; promotion?: 'queen' | 'rook' | 'bishop' | 'knight' } }
  | { type: 'NEW_GAME' }
  | { type: 'UNDO_MOVE' }
  | { type: 'SET_POSITION'; payload: string }
  | { type: 'START_MOVE_ANIMATION'; payload: { moves: AnimatingMove[] } }
  | { type: 'ANIMATION_PIECE_COMPLETE' }
  | { type: 'COMPLETE_MOVE_ANIMATION' }
  | { type: 'SET_SELECTED_SQUARE'; payload: string | null }
  | { type: 'LOAD_GAME'; payload: ParsedGame }
  | { type: 'SET_GAME_MODE'; payload: GameMode }
  | { type: 'GO_TO_MOVE'; payload: number }
  | { type: 'GO_TO_NEXT' }
  | { type: 'GO_TO_PREVIOUS' }
  | { type: 'GO_TO_START' }
  | { type: 'GO_TO_END' };

// 애니메이션 상태 인터페이스
interface AnimatingMove {
  from: string;
  to: string;
  piece: ChessPiece;
}

interface AnimationState {
  isAnimating: boolean;
  animatingMoves: AnimatingMove[]; // 캐슬링 등 여러 기물이 동시에 이동
  completedAnimations: number;
}

// Context 타입
interface GameContextType {
  gameState: GameState;
  position: BoardPosition;
  selectedSquare: string | null;
  possibleMoves: string[];
  lastMove: { from: string; to: string } | null;
  capturedPieces: { white: ChessPiece[]; black: ChessPiece[] };
  isWhiteInCheck: boolean;
  isBlackInCheck: boolean;
  isGameOver: boolean;
  gameResult: string | null;
  pendingPromotion: { from: string; to: string } | null;
  animationState: AnimationState;
  
  // 기존 기능
  makeMove: (from: string, to: string, promotion?: 'queen' | 'rook' | 'bishop' | 'knight') => boolean;
  setSelectedSquare: (square: string | null) => void;
  onAnimationComplete: () => void;
  newGame: () => void;
  undoMove: () => void;
  
  // 새로운 분석 모드 기능
  gameMode: GameMode;
  loadedGame: ParsedGame | null;
  currentMoveIndex: number;
  canGoNext: boolean;
  canGoPrevious: boolean;
  loadGame: (parsedGame: ParsedGame) => void;
  setGameMode: (mode: GameMode) => void;
  goToMove: (index: number) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  goToStart: () => void;
  goToEnd: () => void;
}

// 초기 애니메이션 상태
const initialAnimationState: AnimationState = {
  isAnimating: false,
  animatingMoves: [],
  completedAnimations: 0,
};

// 초기 상태
const initialGameState: GameState = {
  position: '', // FEN 형식 (나중에 구현)
  moves: [],
  currentPlayer: 'white',
  gameStatus: 'playing',
  castlingRights: {
    whiteKingSide: true,
    whiteQueenSide: true,
    blackKingSide: true,
    blackQueenSide: true,
  },
  enPassantSquare: null,
  headers: {
    Date: new Date().toISOString().split('T')[0],
    White: '사용자',
    Black: '상대방',
    Result: '*', // 진행 중
  },
};

// 추가 상태 인터페이스
interface ExtendedGameState extends GameState {
  selectedSquare: string | null;
  animationState: AnimationState;
  gameMode: GameMode;
  loadedGame: ParsedGame | null;
  currentMoveIndex: number;
}

// 초기 확장 상태
const initialExtendedGameState: ExtendedGameState = {
  ...initialGameState,
  selectedSquare: null,
  animationState: {
    isAnimating: false,
    animatingMoves: [],
    completedAnimations: 0,
  },
  gameMode: 'live',
  loadedGame: null,
  currentMoveIndex: -1, // -1은 시작 위치
};

// Reducer 함수
const gameReducer = (state: ExtendedGameState, action: GameAction): ExtendedGameState => {
  switch (action.type) {
    case 'START_MOVE_ANIMATION': {
      const { moves } = action.payload;
      return {
        ...state,
        animationState: {
          isAnimating: true,
          animatingMoves: moves,
          completedAnimations: 0,
        },
        selectedSquare: null, // 애니메이션 시작 시 선택 해제
      };
    }
    
    case 'ANIMATION_PIECE_COMPLETE': {
      const newCompleted = state.animationState.completedAnimations + 1;
      const allCompleted = newCompleted >= state.animationState.animatingMoves.length;
      
      return {
        ...state,
        animationState: {
          ...state.animationState,
          completedAnimations: newCompleted,
          isAnimating: !allCompleted,
        },
      };
    }
    
    case 'COMPLETE_MOVE_ANIMATION': {
      return {
        ...state,
        animationState: {
          isAnimating: false,
          animatingMoves: [],
          completedAnimations: 0,
        },
      };
    }
    
    case 'MAKE_MOVE': {
      const { from, to, promotion } = action.payload;
      
      // 현재 보드 위치 재구성
      const currentPosition = getCurrentPosition(state.moves);
      
      // 특수 이동을 포함한 유효성 검사
      if (!isValidMove(from, to, currentPosition, true, state.castlingRights, state.enPassantSquare)) {
        return state; // 무효한 이동
      }
      
      const piece = currentPosition[from];
      if (!piece) return state;
      
      // 프로모션이 필요한데 지정되지 않은 경우
      if (needsPromotion(to, piece) && !promotion) {
        return state; // 프로모션 기물을 선택해야 함
      }
      
      try {
        // 특수 이동 실행
        const {
          newPosition,
          newCastlingRights,
          newEnPassantSquare,
          moveType,
          capturedPiece
        } = executeSpecialMove(
          from,
          to,
          currentPosition,
          state.castlingRights,
          state.enPassantSquare,
          promotion
        );
        
        // SAN 생성 (특수 이동 고려)
        let san = '';
        if (moveType === 'castle') {
          const side = squareToCoordinate(to)[0] > squareToCoordinate(from)[0] ? 'king' : 'queen';
          san = side === 'king' ? 'O-O' : 'O-O-O';
        } else {
          san = generateSAN(from, to, piece, capturedPiece);
          if (moveType === 'promotion') {
            const promotionSymbols = { queen: 'Q', rook: 'R', bishop: 'B', knight: 'N' };
            san += '=' + promotionSymbols[promotion || 'queen'];
          }
        }
        
        const newMove: ChessMove = {
          from,
          to,
          piece,
          san,
          fen: '', // 나중에 FEN 구현
          timestamp: new Date(),
          promotion,
          isCastle: moveType === 'castle',
          isEnPassant: moveType === 'enpassant',
          capturedPiece,
        };
        
        const newMoves = [...state.moves, newMove];
        const nextPlayer = getCurrentTurn(newMoves.length);
        
        // 게임 종료 상태 확인
        let gameStatus = state.gameStatus;
        let result = state.headers.Result;
        
        if (isCheckmate(newPosition, nextPlayer)) {
          gameStatus = 'checkmate';
          result = nextPlayer === 'white' ? '0-1' : '1-0';
        } else if (isStalemate(newPosition, nextPlayer)) {
          gameStatus = 'stalemate';
          result = '1/2-1/2';
        } else if (isInCheck(newPosition, nextPlayer)) {
          gameStatus = 'check';
        } else {
          gameStatus = 'playing';
        }
        
        // 체크/체크메이트 표시를 SAN에 추가
        if (gameStatus === 'checkmate') {
          san += '#';
        } else if (gameStatus === 'check') {
          san += '+';
        }
        
        return {
          ...state,
          moves: [...state.moves, { ...newMove, san }],
          currentPlayer: nextPlayer,
          gameStatus,
          castlingRights: newCastlingRights,
          enPassantSquare: newEnPassantSquare,
          headers: {
            ...state.headers,
            Result: result,
          },
        };
        
      } catch (error) {
        console.error('Move execution error:', error);
        return state;
      }
    }
    
    case 'NEW_GAME':
      return {
        ...initialExtendedGameState,
        headers: {
          ...initialExtendedGameState.headers,
          Date: new Date().toISOString().split('T')[0],
        },
      };
    
    case 'UNDO_MOVE':
      if (state.moves.length === 0) return state;
      
      const newMoves = state.moves.slice(0, -1);
      
      // 캐슬링 권한을 역계산
      const restoredCastlingRights = calculateCastlingRights(newMoves);
      
      // 앙파상 스퀘어도 역계산
      let restoredEnPassantSquare: string | null = null;
      if (newMoves.length > 0) {
        const lastMove = newMoves[newMoves.length - 1];
        const piece = lastMove.piece;
        
        // 마지막 이동이 폰의 2칸 이동인지 확인
        if (piece.type === 'pawn' && Math.abs(squareToCoordinate(lastMove.to)[1] - squareToCoordinate(lastMove.from)[1]) === 2) {
          const middleRank = piece.color === 'white' ? '3' : '6';
          restoredEnPassantSquare = lastMove.to[0] + middleRank;
        }
      }
      
      return {
        ...state,
        moves: newMoves,
        currentPlayer: getCurrentTurn(newMoves.length),
        castlingRights: restoredCastlingRights,
        enPassantSquare: restoredEnPassantSquare,
        selectedSquare: null, // 실행취소 시 선택 해제
        gameStatus: 'playing', // 게임 상태도 리셋
        headers: {
          ...state.headers,
          Result: '*', // 진행 중으로 복원
        },
      };
    
    case 'SET_SELECTED_SQUARE':
      return {
        ...state,
        selectedSquare: action.payload,
      };
    
    case 'LOAD_GAME':
      return {
        ...state,
        gameMode: 'analysis',
        loadedGame: action.payload,
        currentMoveIndex: -1, // 시작 위치
        selectedSquare: null,
      };
    
    case 'SET_GAME_MODE':
      return {
        ...state,
        gameMode: action.payload,
        selectedSquare: null,
        // live 모드로 전환 시 로드된 게임 초기화
        ...(action.payload === 'live' ? { loadedGame: null, currentMoveIndex: -1 } : {}),
      };
    
    case 'GO_TO_MOVE':
      if (state.gameMode !== 'analysis' || !state.loadedGame) return state;
      const targetIndex = Math.max(-1, Math.min(action.payload, state.loadedGame.totalMoves - 1));
      return {
        ...state,
        currentMoveIndex: targetIndex,
        selectedSquare: null,
      };
    
    case 'GO_TO_NEXT':
      if (state.gameMode !== 'analysis' || !state.loadedGame) return state;
      return {
        ...state,
        currentMoveIndex: Math.min(state.currentMoveIndex + 1, state.loadedGame.totalMoves - 1),
        selectedSquare: null,
      };
    
    case 'GO_TO_PREVIOUS':
      if (state.gameMode !== 'analysis' || !state.loadedGame) return state;
      return {
        ...state,
        currentMoveIndex: Math.max(state.currentMoveIndex - 1, -1),
        selectedSquare: null,
      };
    
    case 'GO_TO_START':
      if (state.gameMode !== 'analysis' || !state.loadedGame) return state;
      return {
        ...state,
        currentMoveIndex: -1,
        selectedSquare: null,
      };
    
    case 'GO_TO_END':
      if (state.gameMode !== 'analysis' || !state.loadedGame) return state;
      return {
        ...state,
        currentMoveIndex: state.loadedGame.totalMoves - 1,
        selectedSquare: null,
      };
    
    default:
      return state;
  }
};

// 캐슬링 권한 역계산 함수
const calculateCastlingRights = (moves: ChessMove[]) => {
  const rights = {
    whiteKingSide: true,
    whiteQueenSide: true,
    blackKingSide: true,
    blackQueenSide: true,
  };
  
  moves.forEach(move => {
    // 킹이 이동한 경우
    if (move.piece.type === 'king') {
      if (move.piece.color === 'white') {
        rights.whiteKingSide = false;
        rights.whiteQueenSide = false;
      } else {
        rights.blackKingSide = false;
        rights.blackQueenSide = false;
      }
    }
    
    // 룩이 이동한 경우
    if (move.piece.type === 'rook') {
      if (move.from === 'a1') rights.whiteQueenSide = false;
      else if (move.from === 'h1') rights.whiteKingSide = false;
      else if (move.from === 'a8') rights.blackQueenSide = false;
      else if (move.from === 'h8') rights.blackKingSide = false;
    }
    
    // 룩이 잡힌 경우
    if (move.capturedPiece?.type === 'rook') {
      if (move.to === 'a1') rights.whiteQueenSide = false;
      else if (move.to === 'h1') rights.whiteKingSide = false;
      else if (move.to === 'a8') rights.blackQueenSide = false;
      else if (move.to === 'h8') rights.blackKingSide = false;
    }
  });
  
  return rights;
};

// 현재 보드 위치 계산 (이동 히스토리에서)
const getCurrentPosition = (moves: ChessMove[]): BoardPosition => {
  let position = getInitialPosition();
  
  moves.forEach(move => {
    if (move.isCastle) {
      // 캐슬링 처리
      const piece = position[move.from];
      if (piece) {
        const side = squareToCoordinate(move.to)[0] > squareToCoordinate(move.from)[0] ? 'king' : 'queen';
        const rank = piece.color === 'white' ? '1' : '8';
        const rookFromSquare = side === 'king' ? 'h' + rank : 'a' + rank;
        const rookToSquare = side === 'king' ? 'f' + rank : 'd' + rank;
        
        // 킹과 룩 이동
        position[move.to] = piece;
        position[move.from] = null;
        position[rookToSquare] = position[rookFromSquare];
        position[rookFromSquare] = null;
      }
    } else if (move.isEnPassant) {
      // 앙파상 처리
      const piece = position[move.from];
      if (piece) {
        const captureRank = piece.color === 'white' ? '5' : '4';
        const captureSquare = move.to[0] + captureRank;
        
        position[move.to] = piece;
        position[move.from] = null;
        position[captureSquare] = null;
      }
    } else {
      // 일반 이동 (프로모션 포함)
      let piece = position[move.from];
      if (piece && move.promotion) {
        piece = { color: piece.color, type: move.promotion };
      }
      position[move.to] = piece;
      position[move.from] = null;
    }
  });
  
  return position;
};

// 게임 트리에서 특정 인덱스까지의 이동들 가져오기
const getMovesUpToIndex = (tree: GameTreeNode, moveIndex: number): ChessMove[] => {
  const moves: ChessMove[] = [];
  let currentNode = tree;
  let currentIndex = 0;
  
  while (currentIndex <= moveIndex && currentNode.children.length > 0) {
    currentNode = currentNode.children[0];
    if (currentNode.move) {
      moves.push(currentNode.move);
      currentIndex++;
    }
  }
  
  return moves;
};

// SAN을 실제 이동으로 변환하는 간단한 파서
const parseSANMove = (san: string, position: BoardPosition, turn: 'white' | 'black'): {from: string, to: string} | null => {
  console.log(`SAN 파싱 시도: ${san}, turn: ${turn}`);
  
  // 캐슬링 처리
  if (san === 'O-O') {
    const rank = turn === 'white' ? '1' : '8';
    return { from: `e${rank}`, to: `g${rank}` };
  }
  if (san === 'O-O-O') {
    const rank = turn === 'white' ? '1' : '8';
    return { from: `e${rank}`, to: `c${rank}` };
  }
  
  // 체크/체크메이트 표시 제거
  const cleanSan = san.replace(/[+#]$/, '');
  
  // 기물 타입 결정
  let pieceType: ChessPiece['type'] = 'pawn';
  let moveStr = cleanSan;
  
  if (/^[KQRBN]/.test(cleanSan)) {
    const pieceMap = { K: 'king', Q: 'queen', R: 'rook', B: 'bishop', N: 'knight' };
    pieceType = pieceMap[cleanSan[0] as keyof typeof pieceMap];
    moveStr = cleanSan.slice(1);
  }
  
  // 목적지 칸 추출 (마지막 2자리가 일반적으로 목적지)
  const destinationMatch = moveStr.match(/([a-h][1-8])(?:=[QRBN])?$/);
  if (!destinationMatch) {
    console.log(`목적지 파싱 실패: ${moveStr}`);
    return null;
  }
  
  const to = destinationMatch[1];
  
  // 해당 기물 타입과 색깔을 가진 모든 기물 찾기
  const candidatePieces: string[] = [];
  for (const square in position) {
    const piece = position[square];
    if (piece && piece.type === pieceType && piece.color === turn) {
      candidatePieces.push(square);
    }
  }
  
  console.log(`${pieceType} 후보들:`, candidatePieces);
  
  // 유효한 이동 찾기
  for (const from of candidatePieces) {
    if (isValidMove(from, to, position, true, {
      whiteKingSide: true, whiteQueenSide: true,
      blackKingSide: true, blackQueenSide: true
    }, null)) {
      console.log(`유효한 이동 발견: ${from} -> ${to}`);
      return { from, to };
    }
  }
  
  console.log(`유효한 이동을 찾지 못했습니다: ${san}`);
  return null;
};

// 게임 트리에서 특정 이동 인덱스의 보드 위치 계산
const getPositionAtMoveIndex = (tree: GameTreeNode, moveIndex: number): BoardPosition => {
  console.log('getPositionAtMoveIndex 호출됨, moveIndex:', moveIndex);
  
  if (moveIndex === -1) {
    // 시작 위치
    console.log('시작 위치 반환');
    return getInitialPosition();
  }
  
  let position = getInitialPosition();
  let currentNode = tree;
  let currentIndex = 0;
  let moveNumber = 0;
  
  while (currentIndex <= moveIndex && currentNode.children.length > 0) {
    currentNode = currentNode.children[0]; // 메인라인
    
    if (currentNode.move && currentNode.san) {
      console.log(`${currentIndex}번째 이동 실행:`, currentNode.san);
      
      const turn = moveNumber % 2 === 0 ? 'white' : 'black';
      const moveCoords = parseSANMove(currentNode.san, position, turn);
      
      if (moveCoords) {
        const { from, to } = moveCoords;
        console.log(`이동 좌표: ${from} -> ${to}`);
        
        // executeSpecialMove를 사용해서 이동 실행
        try {
          const { newPosition } = executeSpecialMove(
            from,
            to,
            position,
            {
              whiteKingSide: true, whiteQueenSide: true,
              blackKingSide: true, blackQueenSide: true
            },
            null
          );
          position = newPosition;
          console.log(`이동 성공: ${currentNode.san}`);
        } catch (error) {
          console.log(`이동 실행 실패: ${currentNode.san}`, error);
        }
      } else {
        console.log(`좌표 파싱 실패: ${currentNode.san}`);
      }
      
      currentIndex++;
      moveNumber++;
    }
  }
  
  console.log(`최종 position (${currentIndex}개 이동 실행됨):`, position);
  return position;
};

// Context 생성
const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider 컴포넌트
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, dispatch] = useReducer(gameReducer, initialExtendedGameState);
  const [animationState, setAnimationState] = React.useState<AnimationState>(initialAnimationState);
  const [pendingPromotion, setPendingPromotion] = React.useState<{ from: string; to: string } | null>(null);
  
  const makeMove = (from: string, to: string, promotion?: 'queen' | 'rook' | 'bishop' | 'knight'): boolean => {
    const currentPosition = getCurrentPosition(gameState.moves);
    const piece = currentPosition[from];
    
    if (!piece) return false;
    
    // 프로모션이 필요한 경우
    if (needsPromotion(to, piece) && !promotion) {
      setPendingPromotion({ from, to });
      return false; // 프로모션 선택 대기
    }
    
    setPendingPromotion(null);
    
    // 애니메이션할 기물들 준비
    const animatingMoves: AnimatingMove[] = [];
    
    // 기본 이동
    animatingMoves.push({ from, to, piece });
    
    // 캐슬링인지 확인
    const isCastling = piece.type === 'king' && Math.abs(squareToCoordinate(to)[0] - squareToCoordinate(from)[0]) === 2;
    if (isCastling) {
      const side = squareToCoordinate(to)[0] > squareToCoordinate(from)[0] ? 'king' : 'queen';
      const rank = piece.color === 'white' ? '1' : '8';
      const rookFromSquare = side === 'king' ? 'h' + rank : 'a' + rank;
      const rookToSquare = side === 'king' ? 'f' + rank : 'd' + rank;
      const rook = currentPosition[rookFromSquare];
      
      if (rook) {
        animatingMoves.push({ from: rookFromSquare, to: rookToSquare, piece: rook });
      }
    }
    
    // 애니메이션 시작
    setAnimationState({
      isAnimating: true,
      animatingMoves,
      completedAnimations: 0,
    });
    
    // 애니메이션 완료 후 이동 처리
    const animationDuration = 320; // AnimatedPiece의 최대 지에 시간과 맞춤 (20% 빠르게 조정)
    
    // 비동기로 처리하여 useInsertionEffect 경고 방지
    requestAnimationFrame(() => {
      setTimeout(() => {
        dispatch({ type: 'MAKE_MOVE', payload: { from, to, promotion } });
        
        // 애니메이션 상태 리셋
        setAnimationState(initialAnimationState);
      }, animationDuration + 50);
    });
    
    return true;
  };
  
  const onAnimationComplete = () => {
    setAnimationState(prev => {
      const newCompletedCount = prev.completedAnimations + 1;
      if (newCompletedCount >= prev.animatingMoves.length) {
        // 모든 애니메이션 완료 - 상태는 setTimeout에서 처리
        return prev;
      }
      return {
        ...prev,
        completedAnimations: newCompletedCount,
      };
    });
  };
  
  const newGame = () => {
    setPendingPromotion(null);
    dispatch({ type: 'NEW_GAME' });
  };
  
  const undoMove = () => {
    setPendingPromotion(null);
    dispatch({ type: 'UNDO_MOVE' });
  };
  
  const setSelectedSquare = (square: string | null) => {
    dispatch({ type: 'SET_SELECTED_SQUARE', payload: square });
  };

  // 새로운 분석 모드 함수들
  const loadGame = (parsedGame: ParsedGame) => {
    dispatch({ type: 'LOAD_GAME', payload: parsedGame });
  };

  const setGameMode = (mode: GameMode) => {
    dispatch({ type: 'SET_GAME_MODE', payload: mode });
  };

  const goToMove = (index: number) => {
    dispatch({ type: 'GO_TO_MOVE', payload: index });
  };

  const goToNext = () => {
    console.log('goToNext 클릭, 현재 인덱스:', gameState.currentMoveIndex);
    dispatch({ type: 'GO_TO_NEXT' });
  };

  const goToPrevious = () => {
    console.log('goToPrevious 클릭, 현재 인덱스:', gameState.currentMoveIndex);
    dispatch({ type: 'GO_TO_PREVIOUS' });
  };

  const goToStart = () => {
    console.log('goToStart 클릭');
    dispatch({ type: 'GO_TO_START' });
  };

  const goToEnd = () => {
    console.log('goToEnd 클릭');
    dispatch({ type: 'GO_TO_END' });
  };

  // 현재 보드 위치 계산 (모드에 따라 다르게 처리)
  const position = React.useMemo(() => {
    if (gameState.gameMode === 'analysis' && gameState.loadedGame) {
      // 분석 모드: 로드된 게임의 특정 이동 위치로 이동
      console.log('분석 모드 position 계산:', gameState.currentMoveIndex);
      const newPosition = getPositionAtMoveIndex(gameState.loadedGame.tree, gameState.currentMoveIndex);
      console.log('계산된 position:', newPosition);
      return newPosition;
    } else {
      // 라이브 모드: 현재 게임 상태
      return getCurrentPosition(gameState.moves);
    }
  }, [gameState.gameMode, gameState.loadedGame, gameState.currentMoveIndex, gameState.moves]);
  
  // 선택된 기물의 가능한 이동 계산
  const possibleMoves = React.useMemo(() => {
    if (!gameState.selectedSquare) return [];
    return getPossibleMoves(
      gameState.selectedSquare,
      position,
      gameState.castlingRights,
      gameState.enPassantSquare
    );
  }, [gameState.selectedSquare, position, gameState.castlingRights, gameState.enPassantSquare]);
  
  // 체크 상태 계산
  const isWhiteInCheck = isInCheck(position, 'white');
  const isBlackInCheck = isInCheck(position, 'black');
  
  // 게임 종료 상태
  const isGameOver = gameState.gameStatus === 'checkmate' || gameState.gameStatus === 'stalemate';
  const gameResult = isGameOver ? gameState.headers.Result : null;
  
  // 마지막 이동 계산 (모드에 따라 다르게 처리)
  const lastMove = React.useMemo(() => {
    if (gameState.gameMode === 'analysis' && gameState.loadedGame && gameState.currentMoveIndex >= 0) {
      // 분석 모드: 현재 이동 인덱스의 이동
      const moves = getMovesUpToIndex(gameState.loadedGame.tree, gameState.currentMoveIndex);
      if (moves.length === 0) return null;
      const lastMoveData = moves[moves.length - 1];
      return { from: lastMoveData.from, to: lastMoveData.to };
    } else if (gameState.gameMode === 'live') {
      // 라이브 모드: 현재 게임의 마지막 이동
      if (gameState.moves.length === 0) return null;
      const lastMoveData = gameState.moves[gameState.moves.length - 1];
      return { from: lastMoveData.from, to: lastMoveData.to };
    }
    return null;
  }, [gameState.gameMode, gameState.loadedGame, gameState.currentMoveIndex, gameState.moves]);

  // 캡처된 기물 계산
  const capturedPieces = React.useMemo(() => {
    const white: ChessPiece[] = [];
    const black: ChessPiece[] = [];
    
    gameState.moves.forEach(move => {
      if (move.capturedPiece) {
        if (move.capturedPiece.color === 'white') {
          white.push(move.capturedPiece);
        } else {
          black.push(move.capturedPiece);
        }
      }
    });
    
    return { white, black };
  }, [gameState.gameMode, gameState.loadedGame, gameState.currentMoveIndex, gameState.moves]);

  // 네비게이션 상태 계산
  const canGoNext = React.useMemo(() => {
    if (gameState.gameMode !== 'analysis' || !gameState.loadedGame) return false;
    return gameState.currentMoveIndex < gameState.loadedGame.totalMoves - 1;
  }, [gameState.gameMode, gameState.loadedGame, gameState.currentMoveIndex]);

  const canGoPrevious = React.useMemo(() => {
    if (gameState.gameMode !== 'analysis' || !gameState.loadedGame) return false;
    return gameState.currentMoveIndex > -1;
  }, [gameState.gameMode, gameState.loadedGame, gameState.currentMoveIndex]);
  
  const value: GameContextType = {
    gameState,
    position,
    selectedSquare: gameState.selectedSquare,
    possibleMoves,
    lastMove,
    capturedPieces,
    isWhiteInCheck,
    isBlackInCheck,
    isGameOver,
    gameResult,
    pendingPromotion,
    animationState,
    
    // 기존 기능
    makeMove,
    setSelectedSquare,
    onAnimationComplete,
    newGame,
    undoMove,
    
    // 새로운 분석 모드 기능
    gameMode: gameState.gameMode,
    loadedGame: gameState.loadedGame,
    currentMoveIndex: gameState.currentMoveIndex,
    canGoNext,
    canGoPrevious,
    loadGame,
    setGameMode,
    goToMove,
    goToNext,
    goToPrevious,
    goToStart,
    goToEnd,
  };
  
  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

// Hook
export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};