# Phase 2: PGN 리뷰 모드 개발 계획

## 📋 Phase 2 개요

**목표**: 기존 PGN 파일을 불러와서 수 단위로 재생하며 분석할 수 있는 리뷰 모드 구현

**예상 기간**: 3-4일

**전제 조건**: Phase 1 완료 (✅ 완료됨)

---

## 🎯 Phase 2 세부 계획

### 2.1 PGN 파서 구현 (1일)

#### 2.1.1 기본 PGN 파싱 시스템
```
src/utils/pgn/
├── pgnParser.ts         # 메인 PGN 파싱 로직
├── pgnValidator.ts      # PGN 유효성 검증
├── pgnConverter.ts      # PGN ↔ 게임 상태 변환
└── pgnTypes.ts         # PGN 관련 타입 정의
```

**구현할 기능:**
- [ ] PGN 헤더 파싱 ([Event "?"], [White "?"], [Black "?"] 등)
- [ ] 이동 목록 파싱 (1.e4 e5 2.Nf3 Nc6 형태)
- [ ] 주석 및 변화수 처리
- [ ] 게임 결과 파싱 (1-0, 0-1, 1/2-1/2)
- [ ] 오류 처리 및 유효성 검증

#### 2.1.2 파일 시스템 통합
```
src/services/
├── fileService.ts       # 파일 읽기/쓰기
├── clipboardService.ts  # 클립보드 PGN 처리
└── storageService.ts    # AsyncStorage 관리
```

**구현할 기능:**
- [ ] expo-file-system으로 PGN 파일 읽기
- [ ] expo-clipboard으로 PGN 붙여넣기
- [ ] 최근 열어본 파일 목록 저장
- [ ] 파일 메타데이터 캐싱

### 2.2 리뷰 인터페이스 구현 (1.5일)

#### 2.2.1 ReviewModeScreen 메인 화면
```typescript
interface ReviewGameState {
  pgn: string;
  parsedGame: ParsedPGNGame;
  currentMoveIndex: number;
  totalMoves: number;
  gameHistory: ChessMove[];
  isPlaying: boolean;
  playbackSpeed: number; // 0.5x, 1x, 2x
}
```

**구현할 UI:**
- [ ] 게임 정보 카드 (플레이어, 이벤트, 날짜, 결과)
- [ ] 이동 컨트롤 (⏮ ◀ ⏸ ▶ ⏭)
- [ ] 진행바 (현재 수 / 총 수)
- [ ] 재생 속도 조절
- [ ] 자동 재생 기능

#### 2.2.2 고급 네비게이션 기능
**구현할 기능:**
- [ ] 키보드 단축키 (← → 키로 이동)
- [ ] 특정 수로 점프 (수 번호 탭)
- [ ] 북마크 기능 (중요한 수 저장)
- [ ] 변화수(variations) 표시 및 탐색

### 2.3 파일 관리 시스템 (1일)

#### 2.3.1 파일 관리자 화면
```
src/screens/
├── ReviewModeScreen.tsx      # 메인 리뷰 화면
├── FileManagerScreen.tsx     # 파일 목록 관리
└── ImportPGNScreen.tsx      # PGN 가져오기 화면
```

**구현할 기능:**
- [ ] PGN 파일 목록 표시
- [ ] 파일 검색 및 필터링
- [ ] 파일 삭제/이름 변경
- [ ] 폴더별 정리 기능

#### 2.3.2 PGN 가져오기 방식
**지원할 방식:**
- [ ] 파일 시스템에서 .pgn 파일 선택
- [ ] 클립보드에서 PGN 텍스트 붙여넣기
- [ ] 텍스트 직접 입력
- [ ] URL에서 PGN 다운로드 (선택사항)

### 2.4 UI/UX 완성 (0.5일)

#### 2.4.1 컴포넌트 구현
```
src/components/review/
├── GameInfoCard.tsx         # 게임 정보 표시
├── MoveControls.tsx         # 이동 컨트롤 버튼
├── ProgressBar.tsx          # 진행 상황 표시
├── MoveList.tsx            # 이동 목록 (스크롤 동기화)
├── AnnotationViewer.tsx     # 주석 표시
└── ImportModal.tsx          # PGN 가져오기 모달
```

**구현할 기능:**
- [ ] 현재 수 하이라이트
- [ ] 기보 목록과 보드 동기화
- [ ] 매끄러운 애니메이션
- [ ] 반응형 레이아웃

---

## 🗂 샘플 데이터 준비

### 2.5 테스트용 PGN 데이터
```
src/data/samplePGNs/
├── famous_games.ts          # 유명한 게임들
├── opening_examples.ts      # 오프닝 예제
└── endgame_studies.ts       # 엔드게임 연구
```

**포함할 게임:**
- [ ] 카스파로프 vs 딥 블루 (1997)
- [ ] 피셔 vs 스파스키 (1972)
- [ ] 모르피의 유명한 게임들
- [ ] 기본 오프닝 변화수들
- [ ] 기본 엔드게임 패턴들

---

## 🧪 테스트 계획

### 테스트해야 할 기능들
- [ ] PGN 파싱 정확성 (다양한 형식)
- [ ] 이동 재생 정확성
- [ ] UI 반응성 및 성능
- [ ] 파일 시스템 접근
- [ ] 오류 처리 (잘못된 PGN)

### 테스트 PGN 예제
```pgn
[Event "World Championship"]
[Site "New York"]
[Date "1972.07.11"]
[Round "1"]
[White "Fischer, Robert J."]
[Black "Spassky, Boris V."]
[Result "1-0"]

1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Be7 6.Re1 b5 7.Bb3 d6 8.c3 O-O 
9.h3 Nb8 10.d4 Nbd7 1-0
```

---

## 📚 필요한 패키지

```bash
# PGN 처리를 위한 패키지들
npm install @react-native-async-storage/async-storage  # 이미 있을 수 있음
npm install expo-file-system                          # 이미 있을 수 있음  
npm install expo-clipboard                             # PGN 클립보드 지원

# UI 개선을 위한 패키지 (선택사항)
npm install react-native-slider                       # 진행바
npm install react-native-vector-icons                 # 아이콘
```

---

## 🎯 Phase 2 성공 기준

### 필수 기능 (Must Have)
- [ ] PGN 파일 또는 텍스트를 정확히 파싱
- [ ] 수 단위로 앞뒤 이동 가능
- [ ] 체스보드에 위치가 정확히 표시
- [ ] 게임 정보 (플레이어, 결과 등) 표시
- [ ] 기존 ChessBoard 컴포넌트와 완벽 호환

### 고급 기능 (Nice to Have)
- [ ] 자동 재생 기능
- [ ] 키보드 단축키 지원
- [ ] 변화수 표시
- [ ] 주석 표시
- [ ] 북마크 기능

### 성능 요구사항
- [ ] 1000수가 넘는 게임도 부드럽게 처리
- [ ] TypeScript 컴파일 오류 없음
- [ ] iOS 시뮬레이터에서 60fps 유지
- [ ] 메모리 누수 없음

---

## 🚀 Phase 2 시작 준비사항

### Phase 1에서 이어받는 것들
- ✅ React Navigation 시스템
- ✅ MainMenuScreen에서 Review 모드로 진입 가능
- ✅ 기존 ChessBoard, GameContext 재사용 가능
- ✅ TypeScript 환경 완전 구성

### Phase 2 시작 전 확인사항
- [ ] Phase 1 완전 동작 확인
- [ ] 개발 서버 정상 실행 (localhost:8081)
- [ ] 필요한 패키지 설치
- [ ] 샘플 PGN 데이터 준비

---

**Phase 2 시작 준비 완료! 🎉**

다음 세션에서는 PGN 파서부터 구현을 시작할 수 있습니다.