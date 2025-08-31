# 다음 세션 체크리스트

**세션 시작 전 필수 확인사항**

## ✅ 환경 준비 (2분)

### 1. 프로젝트 위치 확인
```bash
cd /Users/peter/Dev/ChessNote
pwd  # 정확한 위치: /Users/peter/Dev/ChessNote
```

### 2. 개발 서버 실행
```bash
# 기본 실행
npx expo start --port 8081

# 캐시 문제 시
npx expo start --port 8081 --clear

# 성공 시 표시: "Waiting on http://localhost:8081"
```

### 3. iOS 시뮬레이터 준비
```bash
# iPhone 16 Pro 시뮬레이터 실행 (검증된 기기)
npx expo run:ios --device "iPhone 16 Pro"

# 또는 Expo 개발 도구에서 'i' 키 입력
```

## 🧪 기능 검증 (5분)

### Core 기능 테스트
- [ ] 메인 메뉴 4개 모드 버튼 정상 표시
- [ ] 설정 버튼(⚙️) 클릭 → 설정 화면 진입
- [ ] 테마 전환 → 즉시 색상 변경 확인
- [ ] 각 게임 모드 진입 → 오류 없이 로드

### 새로운 기능 테스트  
- [ ] **AI 대전 모드**: Stockfish 엔진 동작 (2-3초 로딩 정상)
- [ ] **설정 화면**: 모든 설정 항목 동작 확인
- [ ] **테마 시스템**: Light/Dark/Classic 전환
- [ ] **보드 테마**: Classic/Modern/Wooden/Marble 변경
- [ ] **햅틱 피드백**: 실기기에서 터치감 확인

## 🐛 알려진 이슈 대응

### Reanimated 경고 (무시 가능)
```
[Reanimated] Seems like you are using a Babel plugin...
```
→ 앱 동작에 문제없음, 경고 무시하고 진행

### Android 관련
- NDK 빌드 이슈로 `npx expo run:android` 대신 개발 서버 사용
- 에뮬레이터는 `npx expo start` 후 'a' 키로 실행

### 포트 충돌
- 8081 사용 중이면 8082 사용: `--port 8082`

## 📋 Phase 6 작업 계획

### 우선순위 1: 테스트 구축
```bash
# Jest 테스트 환경 설정
npm test

# TypeScript 타입 체크
npx tsc --noEmit

# 테스트 파일 생성 위치
mkdir -p src/__tests__
```

### 우선순위 2: 성능 검증
- [ ] 메모리 사용량 프로파일링
- [ ] 60fps 유지 확인
- [ ] 앱 시작 시간 측정
- [ ] Stockfish 엔진 로딩 시간 최적화

### 우선순위 3: 실기기 테스트
- [ ] iPhone 실기기 테스트
- [ ] Android 실기기 테스트  
- [ ] 다양한 화면 크기 대응 확인
- [ ] 배터리 사용량 측정

## 🚀 배포 준비 체크리스트

### 앱 메타데이터
- [ ] 버전 번호: 1.2.0 (현재 1.1.0)
- [ ] 빌드 번호 증가
- [ ] 앱 아이콘 최종 확인
- [ ] 스플래시 스크린 업데이트

### 스토어 준비물
- [ ] 앱스토어 스크린샷 (iPhone)
- [ ] 구글 플레이 스크린샷 (Android)
- [ ] 앱 설명문 (한국어/영어)
- [ ] 개인정보처리방침 (필수)

## 📁 중요 파일 위치 참고

### 최근 완성된 파일들
```
/src/context/ThemeContext.tsx           # 테마 관리
/src/screens/SettingsScreen.tsx         # 설정 화면
/src/utils/stockfishEngine.ts          # Stockfish 엔진
/src/utils/hapticFeedback.ts           # 햅틱 피드백
```

### 참조 문서
```
/DEVELOPMENT_PLAN.md                   # 전체 개발 계획
/PROJECT_COMPLETION_REPORT.md          # 프로젝트 완성 보고서
/SESSION_HANDOFF_2025-08-28.md        # 오늘 세션 상세 기록
/STOCKFISH_INTEGRATION.md              # Stockfish 통합 가이드
```

## ⏰ 예상 작업 시간

### Phase 6 완료까지
- **테스트 작성**: 2-3시간
- **성능 최적화**: 1-2시간  
- **실기기 테스트**: 1-2시간
- **배포 준비**: 1-2시간
- **총 예상**: 5-9시간 (1-2일)

### 최종 목표
**완전한 프로덕션 앱** - 앱스토어 출시 가능 수준! 🎯

---

**🎉 현재 상태: ChessNote v1.2.0-beta**  
**✅ 4가지 게임 모드 완성**  
**✅ Stockfish 엔진 통합 완료**  
**✅ 프로페셔널 UI/UX 적용**  
**🚀 다음: 테스트 및 배포 준비**