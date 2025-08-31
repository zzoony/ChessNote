# 📱 ChessNote - 체스기보 모바일 앱

<div align="center">

![Chess Icon](./assets/icon.png)

**완전한 체스 규칙을 갖춘 프로덕션 레벨 체스 게임**

[![React Native](https://img.shields.io/badge/React_Native-0.79.5-blue.svg)](https://reactnative.dev/)
[![Expo SDK](https://img.shields.io/badge/Expo_SDK-53-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Private-red.svg)]()

</div>

## 🎯 프로젝트 개요

ChessNote는 iOS/Android 크로스플랫폼 체스기보 작성 앱입니다. 빠른 로딩 속도를 중시하며, 상단 체스판, 중간 기보 출력, 하단 게임 컨트롤 버튼의 최적화된 레이아웃을 제공합니다.

### ✨ 핵심 특징
- 🏆 **완전한 체스 규칙**: 모든 기물 이동, 체크/체크메이트/스테일메이트 감지
- ⚡ **특수 이동 완전 구현**: 캐슬링, 앙파상, 폰 프로모션 (UI 포함)
- 📋 **실시간 PGN 기보**: 특수 이동 포함 정확한 체스 표기법
- 🎮 **직관적 인터페이스**: 터치 기반 기물 이동, 프로모션 선택 UI
- 📱 **크로스플랫폼**: React Native + Expo로 iOS/Android 동시 지원

## 🚀 현재 구현 상태 (Phase 7 완료)

### ✅ 완성된 기능들

#### 🎮 완전한 체스 게임플레이
- **모든 기물 이동 규칙**: 폰, 룩, 비숍, 퀸, 나이트, 킹 각각의 정확한 이동 패턴
- **경로 확인**: 기물 이동 시 중간 장애물 검사 (`isPathClear`)
- **턴 기반 검증**: 자신의 기물만 이동 가능하도록 엄격 제어
- **킹 안전성**: 이동 후 킹이 체크에 노출되는지 검증

#### 🏆 게임 완료 시스템
- **체크 감지**: 킹이 공격받는 상황 실시간 감지 및 경고 표시
- **체크메이트**: 합법적 이동이 없으면서 체크인 상황 감지
- **스테일메이트**: 합법적 이동이 없지만 체크가 아닌 상황 감지
- **게임 완료 알림**: 체크메이트/스테일메이트 시 결과 표시

#### ⚡ 특수 이동 완전 구현
- **캐슬링 (Castling)**: 킹사이드/퀸사이드 캐슬링, 모든 조건 검사
- **앙파상 (En Passant)**: 폰의 특수 포획 이동
- **폰 프로모션**: 8랭크 도달 시 퀸/룩/비숍/나이트 선택 UI
- **PGN 표기**: 특수 이동을 위한 정확한 표기법 (O-O, O-O-O, =Q 등)

#### 🎨 사용자 인터페이스
- **직관적 체스보드**: 8x8 격자에 모든 기물 정확히 배치
- **기물 선택**: 터치시 노란색 하이라이트
- **프로모션 다이얼로그**: 폰 프로모션 시 기물 선택 UI
- **실시간 기보**: 백색(밝은 배경)/흑색(어두운 배경) 색상 구분
- **게임 컨트롤**: 새게임, 되돌리기, 공유하기 (Action Sheet/클립보드)

### 📱 테스트 완료 상태
- ✅ **iPhone 16 Pro 시뮬레이터**에서 모든 기능 완전 동작
- ✅ **Metro 서버** 안정 실행 (포트 8081)
- ✅ **TypeScript** 타입 체크 통과
- ✅ **GitHub 저장소** 동기화 완료 (커밋 5807836)

## 🛠️ 기술 스택

### 프론트엔드
- **React Native 0.79.5** - 크로스플랫폼 모바일 앱 프레임워크
- **Expo SDK 53** - 네이티브 기능 통합 및 배포 플랫폼
- **TypeScript 5.8.3** - 타입 안전성 보장

### 상태 관리
- **React Context API** - 게임 상태 관리
- **Custom Hooks** - 체스 로직 추상화

### 체스 엔진
- **chessops 0.14.0** - 체스 로직 라이브러리
- **Custom Chess Logic** - 완전한 체스 규칙 구현

### UI 컴포넌트
- **react-native-paper 5.12.3** - Material Design 컴포넌트
- **react-native-vector-icons 10.0.3** - 아이콘 라이브러리

### 네이티브 기능
- **@react-native-clipboard/clipboard 1.16.3** - 클립보드 API
- **expo-sharing 13.1.5** - 네이티브 공유 기능

## 📂 프로젝트 구조

```
ChessNote/
├── 📱 App.tsx                      # 메인 앱 엔트리포인트
├── 📋 src/
│   ├── components/
│   │   ├── ChessBoard/            # 체스보드 관련 컴포넌트
│   │   │   ├── ChessBoard.tsx     # 메인 체스보드 컴포넌트
│   │   │   ├── Square.tsx         # 개별 칸 컴포넌트
│   │   │   └── PromotionDialog.tsx # 폰 프로모션 UI
│   │   ├── GameNotation/          # 기보 표시 컴포넌트
│   │   │   └── GameNotation.tsx   # PGN 형식 기보
│   │   └── Controls/              # 게임 컨트롤 컴포넌트
│   │       └── GameControls.tsx   # 새게임/되돌리기/공유
│   ├── context/
│   │   └── GameContext.tsx        # 게임 상태 관리
│   ├── utils/
│   │   └── chessLogic.ts          # 체스 로직 유틸리티
│   └── types/
│       └── chess.ts               # TypeScript 타입 정의
├── 🎨 assets/pieces/              # 12개 체스 기물 이미지
├── 📱 ios/                        # iOS 네이티브 프로젝트
├── 🤖 android/                    # Android 네이티브 프로젝트
└── 📋 docs/                       # 프로젝트 문서
```

## 🚀 설치 및 실행 방법

### 1. 프로젝트 클론

```bash
git clone https://github.com/zzoony/ChessNote.git
cd ChessNote
```

### 2. 종속성 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
# Metro 서버 시작
npx expo start --port 8081

# 또는 캐시 클리어 후 실행
npx expo start --clear
```

### 4. 앱 실행

```bash
# iOS 시뮬레이터 (권장: iPhone 16 Pro)
npx expo run:ios --device "iPhone 16 Pro"

# Android 에뮬레이터
npx expo run:android
```

### 5. Android APK 빌드 (프로덕션)

```bash
# 🚀 자동 환경 설정 (권장)
./setup-android.sh

# APK 빌드
cd android && ./gradlew assembleRelease
```

**완전한 Android 빌드 가이드**: [ANDROID_BUILD_GUIDE.md](./ANDROID_BUILD_GUIDE.md) 참조

### 6. TypeScript 타입 체크

```bash
npx tsc --noEmit
```

## 🎮 사용 방법

1. **기물 이동**: 기물을 터치하여 선택 후 목적지를 터치
2. **특수 이동**: 캐슬링, 앙파상은 일반 이동과 동일한 방식
3. **폰 프로모션**: 폰이 8랭크 도달 시 기물 선택 다이얼로그 표시
4. **게임 컨트롤**: 하단 버튼으로 새게임, 되돌리기, PGN 공유
5. **기보 확인**: 중간 영역에서 실시간 PGN 형식 기보 확인

## 📈 개발 진행 상황

### 🏆 Phase 7 완료 (2025-08-25)
- ✅ **완전한 체스 규칙 시스템**: 모든 기물 이동 규칙
- ✅ **특수 이동 완전 구현**: 캐슬링, 앙파상, 폰 프로모션
- ✅ **게임 완료 처리**: 체크/체크메이트/스테일메이트 감지
- ✅ **프로모션 사용자 인터페이스**: 기물 선택 다이얼로그
- ✅ **iOS 시뮬레이터 완전 동작**: iPhone 16 Pro에서 모든 기능 검증

### 🎯 다음 개발 단계 (Phase 8: UI/UX 고급화)

#### 1. 가능한 이동 표시
- 기물 선택 시 이동 가능한 칸에 점 또는 하이라이트 표시
- 불법 이동 시도 시 시각적 피드백

#### 2. 마지막 이동 하이라이트
- 이전 이동의 출발지와 목적지 칸 하이라이트
- 게임 진행 상황 시각적 추적 개선

#### 3. 기물 이동 애니메이션
- 부드러운 기물 이동 효과
- 캡처 애니메이션
- 특수 이동 애니메이션

#### 4. 게임플레이 향상
- 캡처된 기물 표시 영역
- 게임 시간 측정 및 표시
- 다크/라이트 모드 지원

### 🔮 장기 로드맵 (Phase 9-10)
- **게임 관리**: 저장/불러오기, 히스토리, PGN 가져오기
- **분석 기능**: 위치 평가, 오프닝 표시, 교육 모드
- **사용자 설정**: 보드 테마, 기물 스타일, 사운드 효과
- **앱스토어 배포**: iOS/Android 배포 준비

## 🔧 개발 환경

### 필수 도구
- **Node.js** 18.x 이상
- **Expo CLI** 최신 버전
- **Xcode** 15.x (iOS 개발용)
- **Android Studio** (Android 개발용)

### 권장 IDE
- **Visual Studio Code** + React Native 확장
- **Xcode** (iOS 시뮬레이터용)

## 📊 참조 프로젝트 활용

### en-croissant 프로젝트
- **참조 위치**: `/Users/peter/Dev/References/en-croissant`
- **활용 내역**: 
  - 체스보드 UI 레이아웃 참조
  - 기물 이미지 스타일 가이드
  - PGN 처리 로직 참고

### ChessBoard 튜토리얼
- **참조 위치**: `/Users/peter/Dev/References/Tutorials/ChessBoard`
- **활용 내역**:
  - 기물 이미지 에셋 활용 (12개 PNG 파일)
  - 기본 체스보드 HTML/CSS 구조 참고
  - 기물 배치 로직 참조

## 🎉 주요 성과

### 기술적 성취
- **완전한 체스 규칙 구현**: 복잡한 게임 룰을 코드로 완전히 구현
- **재귀적 알고리즘**: 체크메이트 감지를 위한 모든 가능한 이동 탐색
- **상태 머신 설계**: 게임의 다양한 상태(체크, 체크메이트, 스테일메이트) 관리
- **UI 상태 동기화**: 복잡한 게임 로직과 사용자 인터페이스의 완벽한 동기화

### 개발 품질
- **TypeScript 100%**: 타입 안전성 보장
- **Component 기반 설계**: 재사용 가능한 컴포넌트 구조
- **상태 관리 최적화**: Context API 활용한 효율적 상태 관리
- **프로덕션 레벨**: 실제 사용 가능한 완전한 체스 게임

## 📄 라이선스

이 프로젝트는 비공개 라이선스입니다.

## 🤝 기여

현재는 개인 프로젝트로 진행 중입니다.

## 📞 연락처

GitHub: [zzoony/ChessNote](https://github.com/zzoony/ChessNote)

---

<div align="center">

**🏆 완전한 체스 규칙을 갖춘 프로덕션 레벨 체스 게임 완성! 🏆**

*다음 단계: UI/UX 고급화로 더욱 세련된 체스 앱 구현*

</div>