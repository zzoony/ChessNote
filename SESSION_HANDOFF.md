# 🔄 세션 전달 가이드

## 📋 다음 세션에서 이 프로젝트를 이어받는 방법

### 1. 컨텍스트 초기화 후 시작 방법

```
안녕하세요! 체스기보 모바일 앱 개발을 이어서 진행하겠습니다.

현재 프로젝트 상태를 확인하기 위해 다음 파일들을 읽어주세요:

1. 먼저 NEXT_SESSION.md 파일을 읽어서 현재 진행 상황을 파악해주세요.
2. README.md로 프로젝트 개요를 확인해주세요.  
3. 현재 디렉토리의 파일 구조를 확인해주세요.

그리고 앱 실행을 최우선 목표로 해주세요!
```

### 2. 핵심 상태 요약

#### ✅ 완료된 것
- React Native + Expo + TypeScript 프로젝트 완성
- 체스보드, 기보표시, 제어버튼 모든 컴포넌트 구현
- 게임 상태 관리 Context 완성  
- TypeScript 컴파일 성공 (에러 없음)
- 체스 기물 이미지 12개 추가

#### ❌ 미완료된 것
- 실제 앱 실행 (시스템 파일 제한 오류)
- 실기기/시뮬레이터에서 테스트
- 체스 규칙 완전 구현 (현재는 기본만)

#### 🎯 다음 우선순위
1. **앱 실행 성공** (EMFILE 오류 해결)
2. **실제 기능 테스트**
3. **체스 로직 개선**

### 3. 빠른 시작 명령어

```bash
# 프로젝트 이동
cd /Users/peter/Dev/ChessNote

# 파일 제한 해결
ulimit -n 4096

# 상태 확인
npx tsc --noEmit

# 앱 실행 시도
npx expo start
```

### 4. 문제 해결 가이드

#### EMFILE 오류 해결
```bash
# 방법 1: 파일 제한 증가
ulimit -n 4096

# 방법 2: watchman 설치
brew install watchman

# 방법 3: 시스템 설정
sudo launchctl limit maxfiles 65536 200000
```

#### 대체 실행 방법
```bash
# Expo Go 앱으로 테스트 (추천)
npx expo start

# iOS 시뮬레이터
npx expo run:ios

# Android (SDK 설치 필요)  
npx expo run:android
```

### 5. 코드 구조 이해

#### 메인 파일들
- `App.tsx`: 메인 앱 (GameProvider로 감싸진 GameScreen)
- `src/components/ChessBoard/`: 체스보드 + Square 컴포넌트
- `src/components/GameNotation/`: 실시간 기보 표시
- `src/components/Controls/`: 새게임, 되돌리기, 공유 버튼
- `src/context/GameContext.tsx`: 게임 상태 관리

#### 핵심 로직
- 체스보드 클릭 → GameContext의 makeMove 호출
- makeMove → 새로운 ChessMove 생성 → 상태 업데이트  
- 상태 변경 → 체스보드와 기보 자동 동기화

### 6. 예상되는 첫 실행 이슈들

#### 1. Metro bundler 시작 안됨
- 해결: 파일 제한 증가 또는 watchman 설치

#### 2. iOS 시뮬레이터 실행 안됨  
- 해결: Xcode 설치 또는 Expo Go 앱 사용

#### 3. Android 에뮬레이터 실행 안됨
- 해결: Android Studio + SDK 설치

#### 4. 기능은 작동하지만 체스 규칙 위반
- 해결: chessops 라이브러리 완전 활용 (현재는 기본만 구현)

### 7. 성공 시나리오

앱이 실행되면 다음과 같이 작동해야 합니다:

1. **체스보드 표시**: 8x8 그리드에 모든 기물 정확히 배치
2. **기물 선택**: 터치시 노란색 하이라이트
3. **기물 이동**: 다른 칸 터치시 이동 + 기보 업데이트
4. **제어 버튼**: 새게임, 되돌리기, 공유 모두 작동
5. **PGN 생성**: 이동할 때마다 기보에 실시간 추가

### 8. 디버깅 도구

```bash
# TypeScript 체크
npx tsc --noEmit

# 패키지 상태
npm ls

# 파일 구조 확인
find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules

# Metro 로그 확인
npx expo start --clear
```

## 🎯 성공 지표

- [ ] `npx expo start` 성공 실행
- [ ] QR 코드 또는 시뮬레이터에서 앱 로드
- [ ] 체스보드가 정상 표시됨
- [ ] 기물 터치시 노란색 하이라이트 표시
- [ ] 기물 이동시 실시간 기보 업데이트
- [ ] 제어 버튼들이 올바르게 작동

---

**🚀 완성된 코드가 실행되기를 기다리고 있습니다! 화이팅!**