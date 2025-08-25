# 기술 명세서 - 체스기보 앱

## 1. 아키텍처 개요

### 1.1 전체 구조
```
┌─────────────────┐
│   React Native  │  ← UI Layer
├─────────────────┤
│  Game Context   │  ← State Management
├─────────────────┤
│  Chess Engine   │  ← Business Logic
├─────────────────┤
│ File System API │  ← Data Persistence
└─────────────────┘
```

### 1.2 컴포넌트 계층구조
```
App
├── GameProvider (Context)
├── ChessBoard
│   ├── Square (64개)
│   └── ChessPiece
├── GameNotation
│   └── MoveList
└── GameControls
    ├── NewGameButton
    ├── UndoButton
    └── ShareButton
```

## 2. 핵심 라이브러리

### 2.1 체스 엔진
```bash
npm install chessops
```
- **용도**: 체스 규칙, 이동 검증, PGN 처리
- **장점**: TypeScript 지원, 가볍고 빠름
- **en-croissant에서 검증됨**

### 2.2 UI 라이브러리
```bash
npm install react-native-paper react-native-vector-icons
```
- **용도**: 일관된 Material Design UI
- **버튼, 카드, 테마 지원**

### 2.3 파일 및 공유
```bash
npm install expo-file-system expo-sharing
```
- **expo-file-system**: 로컬 파일 저장
- **expo-sharing**: 네이티브 공유 메뉴

## 3. 데이터 구조

### 3.1 게임 상태
```typescript
interface GameState {
  // 현재 보드 상태 (FEN 형식)
  position: string;
  
  // 이동 히스토리
  moves: Array<{
    san: string;      // 'e4', 'Nf3' 등
    fen: string;      // 이동 후 위치
    timestamp: Date;
  }>;
  
  // 게임 정보
  currentPlayer: 'white' | 'black';
  gameStatus: 'playing' | 'checkmate' | 'stalemate' | 'draw';
  
  // PGN 메타데이터
  headers: {
    Event?: string;
    Site?: string;
    Date: string;
    White: string;
    Black: string;
    Result: string;
  };
}
```

### 3.2 체스보드 인터페이스
```typescript
interface ChessBoardProps {
  position: string;                    // FEN 위치
  orientation: 'white' | 'black';     // 보드 방향
  interactive: boolean;               // 이동 가능 여부
  onMove: (move: ChessMove) => void;  // 이동 콜백
  highlightSquares?: string[];        // 하이라이트할 칸들
}

interface ChessMove {
  from: string;    // 'e2'
  to: string;      // 'e4'
  promotion?: string; // 'q', 'r', 'b', 'n'
}
```

## 4. 핵심 구현 로직

### 4.1 체스보드 렌더링
```typescript
// 8x8 그리드 생성
const renderBoard = () => {
  const squares = [];
  for (let rank = 8; rank >= 1; rank--) {
    for (let file = 0; file < 8; file++) {
      const square = String.fromCharCode(97 + file) + rank; // 'a1', 'b1' 등
      squares.push(
        <Square 
          key={square}
          square={square}
          piece={getPieceAt(square)}
          isLight={(file + rank) % 2 === 1}
          onPieceMove={handlePieceMove}
        />
      );
    }
  }
  return squares;
};
```

### 4.2 이동 검증 및 처리
```typescript
const handlePieceMove = (from: string, to: string) => {
  const chess = new Chess(currentPosition);
  
  // 합법적 이동인지 검증
  const moves = chess.legalMoves();
  const move = moves.find(m => 
    m.from === parseSquare(from) && 
    m.to === parseSquare(to)
  );
  
  if (move) {
    // 이동 실행
    chess.play(move);
    
    // 상태 업데이트
    updateGameState({
      position: chess.fen,
      moves: [...currentMoves, {
        san: makeSan(chess.pos, move),
        fen: chess.fen,
        timestamp: new Date()
      }]
    });
  }
};
```

### 4.3 PGN 생성
```typescript
const generatePGN = (gameState: GameState): string => {
  let pgn = '';
  
  // 헤더 섹션
  Object.entries(gameState.headers).forEach(([key, value]) => {
    pgn += `[${key} "${value}"]\n`;
  });
  
  pgn += '\n';
  
  // 이동 섹션
  gameState.moves.forEach((move, index) => {
    if (index % 2 === 0) {
      pgn += `${Math.floor(index / 2) + 1}. `;
    }
    pgn += `${move.san} `;
  });
  
  pgn += gameState.headers.Result;
  
  return pgn;
};
```

## 5. 성능 최적화

### 5.1 렌더링 최적화
```typescript
// React.memo로 불필요한 리렌더링 방지
const Square = React.memo(({ square, piece, isLight, onPieceMove }) => {
  // 렌더링 로직
});

// useMemo로 복잡한 계산 캐싱
const legalMoves = useMemo(() => {
  const chess = new Chess(position);
  return chess.legalMoves();
}, [position]);
```

### 5.2 메모리 관리
```typescript
// 이동 히스토리 제한 (메모리 절약)
const MAX_HISTORY = 1000;

const addMove = (newMove) => {
  setGameState(prev => ({
    ...prev,
    moves: prev.moves.length >= MAX_HISTORY 
      ? [...prev.moves.slice(1), newMove]
      : [...prev.moves, newMove]
  }));
};
```

## 6. 파일 처리

### 6.1 PGN 저장
```typescript
import * as FileSystem from 'expo-file-system';

const savePGNFile = async (pgnContent: string) => {
  const filename = `game_${Date.now()}.pgn`;
  const fileUri = FileSystem.documentDirectory + filename;
  
  await FileSystem.writeAsStringAsync(fileUri, pgnContent);
  return fileUri;
};
```

### 6.2 파일 공유
```typescript
import * as Sharing from 'expo-sharing';

const sharePGN = async (gameState: GameState) => {
  const pgnContent = generatePGN(gameState);
  const fileUri = await savePGNFile(pgnContent);
  
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/x-chess-pgn',
      dialogTitle: '체스 기보 공유'
    });
  }
};
```

## 7. 테마 및 스타일링

### 7.1 체스보드 색상
```typescript
const BOARD_COLORS = {
  lightSquare: '#f0d9b5',  // 밝은 칸
  darkSquare: '#b58863',   // 어두운 칸
  highlight: '#ffff00',    // 하이라이트
  lastMove: '#ffde6a'      // 마지막 이동
};

const THEME = {
  background: '#312e2b',   // 배경
  text: '#ffffff',         // 텍스트
  buttonPrimary: '#4CAF50', // 주요 버튼
  buttonSecondary: '#757575' // 보조 버튼
};
```

## 8. 에러 처리

### 8.1 체스 엔진 오류
```typescript
try {
  const chess = new Chess(position);
  const move = parseMove(moveString);
  chess.play(move);
} catch (error) {
  console.error('Invalid move:', error);
  showErrorMessage('유효하지 않은 이동입니다.');
}
```

### 8.2 파일 시스템 오류
```typescript
const saveWithErrorHandling = async (content: string) => {
  try {
    return await savePGNFile(content);
  } catch (error) {
    console.error('File save error:', error);
    showErrorMessage('파일 저장에 실패했습니다.');
    return null;
  }
};
```

## 9. 테스트 전략

### 9.1 단위 테스트
```typescript
// 체스 로직 테스트
describe('Chess Logic', () => {
  test('should validate legal moves', () => {
    const chess = new Chess();
    const moves = chess.legalMoves();
    expect(moves.length).toBe(20); // 초기 위치에서 20개 이동 가능
  });
  
  test('should generate correct PGN', () => {
    const gameState = createTestGameState();
    const pgn = generatePGN(gameState);
    expect(pgn).toContain('1. e4 e5');
  });
});
```

### 9.2 통합 테스트
```typescript
// 전체 게임 플로우 테스트
describe('Game Flow', () => {
  test('complete game scenario', () => {
    // 1. 새 게임 시작
    // 2. 몇 수 이동
    // 3. 되돌리기
    // 4. PGN 생성 및 검증
  });
});
```