# 완전 독립 iOS 앱 빌드 가이드

ChessNote 앱을 **완전히 독립된 standalone 앱**으로 빌드하여 Metro 서버나 Expo Go 없이 실행하는 방법입니다.

## ⚠️ 중요 사항

**문제**: 이전에 `expo run:ios`로 빌드했을 때 Expo Go 같은 개발 클라이언트 화면이 나타났습니다.
**해결**: `expo prebuild`로 완전한 네이티브 프로젝트를 생성하여 독립 앱을 만듭니다.

## 🔧 설정 완료 상태

### 1. EAS 설정 수정 완료
```json
// eas.json - developmentClient: false로 설정됨
{
  "build": {
    "development": {
      "developmentClient": false,  // 독립 앱으로 설정
      "distribution": "internal"
    },
    "preview": {
      "developmentClient": false,  // 독립 앱으로 설정
      "distribution": "internal"
    }
  }
}
```

### 2. 네이티브 프로젝트 생성 완료
```bash
# 이미 실행됨 - 다시 실행할 필요 없음
npx expo prebuild --platform ios --clean
```

## 🚀 완전 독립 앱 빌드 방법

### 방법 1: Xcode 사용 (권장)

#### 1단계: Xcode 열기
```bash
cd /Users/peter/Dev/ChessNote/ios
open ChessNote.xcworkspace
```

#### 2단계: 빌드 설정
1. **Target**: ChessNote 선택
2. **Scheme**: Release로 변경
   - Product → Scheme → Edit Scheme...
   - Run → Build Configuration: **Release**
3. **Device**: 실제 iOS 기기 선택 (시뮬레이터 X)

#### 3단계: 서명 설정
1. **ChessNote** 타겟 → **Signing & Capabilities**
2. **Team**: Apple Developer 계정 선택
3. **Bundle Identifier**: `com.chessnote.app`
4. **Automatically manage signing** 체크

#### 4단계: 빌드 및 설치
```bash
# Xcode에서
⌘ + Shift + R  # Build for Running (Release mode)
⌘ + R          # Run on device
```

### 방법 2: 명령줄 사용

#### iOS 기기 연결 후:
```bash
cd /Users/peter/Dev/ChessNote
npx expo run:ios --configuration Release --device
```

## ✅ 독립 앱 확인 방법

### 1. 정상적인 독립 앱의 특징:
- ✅ **앱 아이콘**: ChessNote 고유 아이콘
- ✅ **스플래시 화면**: ChessNote 스플래시
- ✅ **메인 화면**: 체스보드가 바로 표시
- ✅ **Metro 불필요**: 개발 서버 없이 실행
- ✅ **완전 오프라인**: 인터넷 없이 모든 기능 사용

### 2. 잘못된 개발 클라이언트의 특징:
- ❌ **Expo Go 화면**: 개발 메뉴나 QR 코드
- ❌ **Metro 의존**: 개발 서버 필요
- ❌ **개발 도구**: Hot Reload, Fast Refresh 등

## 🛠️ 문제 해결

### Expo Go 화면이 나오는 경우

#### 원인 분석:
1. `developmentClient: true`로 설정됨
2. 개발 빌드로 설치됨
3. 네이티브 프로젝트가 아닌 managed 프로젝트

#### 해결 방법:
```bash
# 1. 이전 앱 삭제 (iPhone에서 앱 삭제)
# 2. 프로젝트 클린
cd ios
xcodebuild clean -workspace ChessNote.xcworkspace -scheme ChessNote

# 3. Pods 재설치
pod install

# 4. Xcode에서 Release 모드로 다시 빌드
```

### Metro 서버 의존성 제거 확인

#### Info.plist 확인:
```xml
<!-- ios/ChessNote/Info.plist -->
<key>CFBundleName</key>
<string>ChessNote</string>
<key>CFBundleDisplayName</key>
<string>ChessNote</string>
<!-- Expo Go 관련 설정이 없어야 함 -->
```

#### Bundle JavaScript 확인:
- Release 빌드 시 JavaScript가 앱에 번들로 포함됨
- Metro 서버 연결 코드가 비활성화됨

## 🎯 빌드 최종 확인

### 1. 앱 설치 확인
```bash
# iPhone에서 확인:
1. 홈 화면에 ChessNote 앱 아이콘 표시
2. 앱 탭하여 실행
3. 체스보드가 바로 나타나는지 확인
```

### 2. 독립 실행 테스트
```bash
# Mac에서 Metro 서버 완전 종료
pkill -f metro
pkill -f expo

# iPhone에서 ChessNote 앱 실행
# → 정상 작동하면 완전한 독립 앱
```

### 3. 기능 테스트
- ✅ 기물 이동 애니메이션
- ✅ 가능한 이동 표시
- ✅ 체크/체크메이트 감지
- ✅ PGN 기보 생성
- ✅ 모든 UI 상호작용

## 📊 성능 비교

### 개발 빌드 vs 독립 앱

| 항목 | 개발 빌드 | 독립 앱 |
|------|----------|---------|
| **시작 시간** | 5-10초 | 2-3초 |
| **메모리 사용** | 100-150MB | 50-80MB |
| **배터리 효율** | 낮음 | 높음 |
| **Metro 의존성** | 필요 | 불필요 |
| **오프라인 실행** | 불가 | 가능 |
| **앱스토어 배포** | 불가 | 가능 |

## 🔄 향후 업데이트

### 새로운 기능 추가 시:
1. 소스 코드 수정
2. Release 모드로 다시 빌드
3. 실기기에 재설치

### 버전 업데이트:
```json
// app.json
{
  "expo": {
    "version": "1.0.6",  // 버전 증가
    "ios": {
      "buildNumber": "1.0.6"  // 빌드 번호 증가
    }
  }
}
```

## 📱 최종 결과

**🎉 성공 기준**:
- iPhone에서 ChessNote 앱이 완전히 독립적으로 실행
- Metro 서버나 개발 도구 없이 모든 기능 정상 작동
- 앱스토어 배포 가능한 수준의 standalone 앱 완성

**❌ 실패했다면**:
- Expo Go나 개발 클라이언트 화면이 나타남
- Metro 서버 없이 실행되지 않음
- → 위의 문제 해결 단계 다시 실행

---

**🎯 목표 달성**: ChessNote가 완전한 네이티브 iOS 앱으로 독립 실행! 🚀