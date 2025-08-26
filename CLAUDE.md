# ChessNote 프로젝트 - Claude 설정

체스기보 모바일 앱 개발을 위한 프로젝트별 Claude 설정 파일입니다.

## 📋 프로젝트 개요

**ChessNote**: 완전한 체스 규칙을 갖춘 iOS/Android 크로스플랫폼 체스기보 작성 앱

### 핵심 요구사항
- **원본 비전**: 빠른 로딩 속도, 상단 체스판/중간 기보/하단 컨트롤 최적화 레이아웃
- **현재 상태**: Phase 7 완료 - 완전한 체스 규칙 및 특수 이동 구현 완성
- **다음 목표**: Phase 8 - UI/UX 고급화 (가능한 이동 표시, 애니메이션 등)

## 🛠️ 기술 스택 및 제약사항

### 확정된 기술 스택
```json
{
  "platform": "React Native 0.79.5 + Expo SDK 53",
  "language": "TypeScript 5.8.3",
  "stateManagement": "React Context API",
  "chessEngine": "chessops 0.14.0 + 커스텀 로직",
  "ui": "react-native-paper 5.12.3",
  "testing": "iPhone 16 Pro 시뮬레이터"
}
```

### 절대 변경 금지
- **패키지 버전**: 현재 package.json의 모든 버전 고정
- **프로젝트 구조**: src/ 하위 components/context/utils/types 구조 유지
- **기본 컴포넌트**: ChessBoard, GameNotation, GameControls 핵심 컴포넌트 보존
- **네이티브 설정**: ios/, android/ 디렉토리의 네이티브 설정

## 📂 핵심 파일 구조

### 메인 컴포넌트 (수정 빈도 높음)
```
src/
├── components/ChessBoard/
│   ├── ChessBoard.tsx        # 메인 체스보드 - UI/UX 개선 주요 대상
│   ├── Square.tsx           # 개별 칸 - 시각적 효과 추가 대상
│   └── PromotionDialog.tsx  # 프로모션 UI - 완성됨
├── utils/chessLogic.ts      # 체스 로직 - 완전 구현됨 (수정 최소화)
└── context/GameContext.tsx  # 상태 관리 - 안정된 상태
```

### 참조 자료
- **en-croissant**: `/Users/peter/Dev/References/en-croissant` - 고급 체스 UI 패턴
- **ChessBoard 튜토리얼**: `/Users/peter/Dev/References/Tutorials/ChessBoard` - 기물 이미지

## 🎯 개발 가이드라인

### Phase 8 우선순위 (UI/UX 고급화)
1. **가능한 이동 표시** (최우선)
   - ChessBoard.tsx에서 선택된 기물의 가능한 이동 위치 시각화
   - Square.tsx에 하이라이트 상태 추가

2. **마지막 이동 하이라이트**
   - 이전 이동의 출발지→목적지 칸 표시
   - GameContext에서 lastMove 상태 관리

3. **기물 이동 애니메이션**
   - React Native Animated API 활용
   - 부드러운 기물 이동 효과

4. **게임플레이 향상**
   - 캡처된 기물 표시 영역
   - 게임 시간 측정
   - 다크모드 지원

### 코딩 원칙
- **기존 로직 보존**: chessLogic.ts의 체스 규칙 로직 절대 변경 금지
- **점진적 개선**: 기존 컴포넌트에 기능 추가, 전면 재작성 금지
- **타입 안전성**: 모든 새 코드는 TypeScript 타입 검사 통과 필수
- **성능 최적화**: React.memo, useMemo 활용한 렌더링 최적화

## 🚀 실행 환경

### 검증된 실행 방법

#### iOS 시뮬레이터
```bash
# 프로젝트 위치
cd /Users/peter/Dev/ChessNote

# 실행 (검증된 포트)
npx expo start --port 8081

# iOS 시뮬레이터 (검증된 기기)
npx expo run:ios --device "iPhone 16 Pro"

# TypeScript 체크
npx tsc --noEmit
```

#### Android 에뮬레이터
```bash
# 환경 변수 설정 (필수)
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools

# 에뮬레이터 시작
emulator -avd Medium_Phone_API_36.0 &

# 개발 서버 실행 (포트 8081이 사용 중이면 8082 사용)
npx expo start --port 8082 --android

# 또는 직접 빌드 (현재 NDK 이슈로 권장하지 않음)
# npx expo run:android
```

### 알려진 해결책
- **Metro 연결 문제**: `npx expo start --clear`
- **패키지 이슈**: `npm install` 재실행
- **iOS 빌드 문제**: `cd ios && pod install`
- **Android NDK 문제**: 직접 빌드 대신 개발 서버(`npx expo start`) 사용 권장
- **포트 충돌**: 8081 사용 중이면 8082 사용
- **에뮬레이터 중복 실행**: `adb devices`로 확인 후 기존 프로세스 종료

## 📊 현재 완성된 기능 상태

### ✅ 완전히 구현된 것 (변경 금지)
- 모든 체스 규칙 (킹, 퀸, 룩, 비숍, 나이트, 폰 이동)
- 특수 이동 (캐슬링, 앙파상, 프로모션)
- 체크/체크메이트/스테일메이트 감지
- PGN 기보 생성 및 클립보드 공유
- 터치 기반 기물 이동 인터페이스
- 프로모션 선택 다이얼로그

### 🎯 개선이 필요한 것
- 가능한 이동 시각화 (점 표시)
- 마지막 이동 하이라이트
- 기물 이동 애니메이션
- 캡처된 기물 표시
- 게임 시간 측정
- 다크모드 지원

## 🔧 개발 팁

### 성능 최적화
```typescript
// 체스보드 렌더링 최적화
const MemoizedSquare = React.memo(Square);
const possibleMoves = useMemo(() => 
  calculatePossibleMoves(selectedSquare), [selectedSquare]
);
```

### 시각적 효과 추가 패턴
```typescript
// Square.tsx에 하이라이트 상태 추가
interface SquareProps {
  highlight?: 'selected' | 'possible' | 'lastMove';
  // ...
}
```

### 상태 관리 확장
```typescript
// GameContext에 UI 상태 추가
const [lastMove, setLastMove] = useState<{from: string, to: string} | null>(null);
const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
```

## 📈 성공 지표

### Phase 8 완료 조건
- [ ] 기물 선택 시 가능한 이동 위치 표시
- [ ] 마지막 이동 칸 하이라이트
- [ ] 부드러운 기물 이동 애니메이션
- [ ] 캡처된 기물 표시 영역 추가
- [ ] 게임 시간 측정 기능
- [ ] 다크/라이트 모드 토글

### 품질 기준
- TypeScript 타입 체크 100% 통과
- iPhone 16 Pro 시뮬레이터에서 완전 동작
- 60fps 유지되는 부드러운 애니메이션
- 메모리 사용량 최적화

## 🎉 프로젝트 현황

### 최근 커밋 정보
- **커밋 ID**: 5807836
- **메시지**: "feat: 체스 규칙 완전 구현 - 모든 기물 이동 규칙 및 특수 이동 완성"
- **GitHub**: https://github.com/zzoony/ChessNote

### 현재 단계
- **완료**: Phase 7 (체스 규칙 완전 구현)
- **진행 중**: Phase 8 (UI/UX 고급화)
- **예정**: Phase 9-10 (고급 기능 및 배포)

---

**🚀 다음 세션 시작 시 참고사항:**
1. NEXT_SESSION.md, SESSION_HANDOFF.md 먼저 확인
2. `npx expo start --port 8081`로 앱 실행 상태 확인
3. 가능한 이동 표시부터 시작 (가장 쉬운 UI 개선)
4. 기존 완성된 기능들 절대 변경 금지

**🎯 목표: 세계 최고 수준의 모바일 체스 앱 완성!**