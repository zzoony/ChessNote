# iOS 실기기 빌드 및 설치 가이드

ChessNote 앱을 iOS 실기기에 독립적으로 설치하여 실행하는 방법을 안내합니다.

## 📋 사전 준비사항

### 1. 개발 환경 요구사항
- **macOS**: 최신 버전 권장
- **Xcode**: 15.0 이상 설치 필수
- **iOS 기기**: iOS 15.1 이상
- **Apple Developer 계정**: 무료 계정도 가능 (7일 제한)

### 2. 필수 도구 확인
```bash
# Xcode Command Line Tools 설치 확인
xcode-select --install

# iOS 시뮬레이터 목록 확인
xcrun simctl list devices

# 연결된 실기기 확인
xcrun devicectl list devices
```

## 🚀 빌드 및 설치 방법

### 방법 1: Expo CLI 사용 (권장)

#### 1단계: 프로젝트 디렉토리로 이동
```bash
cd /Users/peter/Dev/ChessNote
```

#### 2단계: iOS 기기 연결 및 확인
```bash
# USB로 iPhone/iPad 연결 후 컴퓨터 신뢰 설정
# 기기 목록 확인
npx expo run:ios --device
```

#### 3단계: 릴리즈 모드로 빌드 및 설치
```bash
# 릴리즈 모드로 빌드 (독립 실행 가능)
npx expo run:ios --configuration Release --device
```

### 방법 2: Xcode 직접 사용

#### 1단계: Xcode 프로젝트 열기
```bash
# iOS 프로젝트 디렉토리에서 Xcode 실행
cd ios
open ChessNote.xcworkspace
```

#### 2단계: Xcode 설정
1. **Target 선택**: ChessNote 
2. **Scheme**: Release로 변경
3. **Destination**: 연결된 실기기 선택
4. **Signing & Capabilities**에서 Team 설정

#### 3단계: 빌드 및 설치
1. **Product** → **Build For** → **Running** (⌘+Shift+R)
2. **Product** → **Run** (⌘+R)
3. 또는 Xcode 상단 재생 버튼 클릭

## 🔧 주요 설정 파일

### app.json 설정 (현재 설정됨)
```json
{
  "expo": {
    "name": "ChessNote",
    "version": "1.0.5",
    "ios": {
      "bundleIdentifier": "com.chessnote.app",
      "buildNumber": "1.0.5",
      "infoPlist": {
        "CFBundleAllowMixedLocalizations": true,
        "ITSAppUsesNonExemptEncryption": false
      }
    }
  }
}
```

### iOS 프로젝트 설정
- **Bundle Identifier**: `com.chessnote.app`
- **Version**: 1.0.5
- **Build Number**: 1.0.5
- **Deployment Target**: iOS 15.1
- **Architecture**: ARM64 (실기기용)

## 📱 실기기 설치 과정

### 1. 개발자 계정 설정
1. Xcode → Preferences → Accounts
2. Apple ID로 로그인 (무료 계정 가능)
3. Team 선택 (Personal Team도 가능)

### 2. 기기 신뢰 설정
1. iPhone 설정 → 일반 → VPN 및 기기 관리
2. 개발자 앱 → [Your Apple ID] 신뢰
3. 신뢰 버튼 탭

### 3. 앱 설치 확인
- 홈 화면에 ChessNote 앱 아이콘 표시
- 독립적으로 실행 가능 (Metro 서버 불필요)
- 모든 기능 정상 작동

## 🛠️ 문제 해결

### 빌드 실패 시
```bash
# 클린 빌드
cd ios
xcodebuild clean -workspace ChessNote.xcworkspace -scheme ChessNote

# Pods 재설치
pod install --repo-update
```

### 서명 오류 시
1. Xcode → Project Settings → Signing & Capabilities
2. "Automatically manage signing" 체크
3. Team 올바르게 선택되어 있는지 확인

### 기기 인식 안됨
```bash
# iOS 기기 재인식
xcrun devicectl list devices --timeout 30
```

## 📊 릴리즈 빌드 특징

### 성능 최적화
- **JavaScript 번들 최적화**: Minification 및 압축 적용
- **메모리 사용량 최적화**: Release 모드 최적화
- **앱 크기 최소화**: 불필요한 개발 도구 제거
- **네이티브 성능**: 60fps 애니메이션 보장

### 독립 실행
- **Metro 서버 불필요**: 번들된 JavaScript 코드 사용
- **완전한 오프라인 실행**: 인터넷 연결 없이 모든 기능 사용 가능
- **네이티브 모듈 포함**: 모든 Expo 모듈 정적 링크

## 🔄 업데이트 배포

### 새 버전 빌드 시
1. `app.json`에서 version 및 buildNumber 증가
2. 릴리즈 모드로 재빌드
3. 실기기에 새로 설치 (기존 앱 덮어쓰기)

### 버전 관리
```bash
# 현재 버전 확인
grep -A 5 -B 5 "version" app.json

# 빌드 번호 확인
grep -A 5 -B 5 "buildNumber" app.json
```

## 📋 체크리스트

### 빌드 전 확인사항
- [ ] iOS 기기 USB 연결 및 신뢰 설정
- [ ] Apple Developer 계정 Xcode에 추가
- [ ] 프로젝트 Team 설정 완료
- [ ] Release 스키마 선택
- [ ] Bundle Identifier 고유성 확인

### 설치 후 확인사항
- [ ] 앱 아이콘 홈 화면에 표시
- [ ] 앱 독립 실행 (Metro 서버 없이)
- [ ] 모든 체스 기능 정상 작동
- [ ] 애니메이션 부드럽게 동작
- [ ] 기기 회전 및 멀티태스킹 지원

## 📞 지원

### 추가 도움이 필요한 경우
1. **Xcode 로그 확인**: Build 로그에서 상세 오류 확인
2. **기기 로그 확인**: Window → Devices and Simulators에서 실시간 로그
3. **Apple Developer 문서**: https://developer.apple.com/documentation/

---

**🎯 목표**: ChessNote 앱을 iOS 실기기에서 완전히 독립적으로 실행
**✅ 결과**: 앱스토어 수준의 릴리즈 빌드로 실기기 설치 완료