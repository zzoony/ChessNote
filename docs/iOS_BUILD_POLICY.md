# iOS 실기기 빌드 정책 (중요)

## 🚨 중요 원칙

**사용자 요구사항**: 앞으로도 항상 iOS 실기기 빌드는 **완전한 standalone 앱**으로 실행할 수 있도록 해야 함.

## 📋 필수 체크리스트

### 실기기 빌드 요청 시 반드시 확인:

#### 1. eas.json 설정 확인
```json
{
  "build": {
    "development": {
      "developmentClient": false,  // ✅ 반드시 false
      "distribution": "internal"
    },
    "preview": {
      "developmentClient": false,  // ✅ 반드시 false
      "distribution": "internal"
    },
    "production": {
      "developmentClient": false,  // ✅ 반드시 false
      "distribution": "store"
    }
  }
}
```

#### 2. AppDelegate.swift 설정 확인 (핵심)
```swift
// ✅ 올바른 standalone 구성
import UIKit
import React

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, RCTBridgeDelegate {
  var window: UIWindow?
  var bridge: RCTBridge!

  func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    bridge = RCTBridge(delegate: self, launchOptions: launchOptions)
    let rootView = RCTRootView(bridge: bridge!, moduleName: "main", initialProperties: nil)
    // ... 표준 React Native 설정
  }
  
  func sourceURL(for bridge: RCTBridge!) -> URL! {
#if DEBUG
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")
#else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
```

#### 3. 네이티브 프로젝트 상태 확인
```bash
# 네이티브 ios 디렉토리가 존재하고 최신 상태인지 확인
ls -la ios/
# ChessNote.xcworkspace 파일이 존재해야 함
```

#### 4. Standalone 앱 빌드 명령어 (검증된 방법)
```bash
# 방법 1: Xcode 사용 (권장) - 검증 완료 2025-08-27
cd ios
pod install  # CocoaPods 의존성 재설치
open ChessNote.xcworkspace
# Xcode에서:
# 1. Target: ChessNote 선택
# 2. Device: 실제 iPhone 선택 (시뮬레이터 X)
# 3. Scheme: Release 모드로 변경 (Product → Scheme → Edit Scheme → Build Configuration: Release)
# 4. ⌘ + R (Build and Run)
```

## ⚠️ 절대 하지 말 것

### ❌ 금지 사항:
1. `developmentClient: true` 설정 사용 금지
2. 개발 빌드로 실기기 설치 금지  
3. Expo Go 의존성 있는 빌드 금지
4. Metro 서버 필수인 앱 배포 금지

### ❌ 실패 신호:
- 실기기에서 Expo Go 같은 화면 표시
- Metro 서버 없이 앱 실행 안됨
- 개발 메뉴나 Hot Reload 기능 표시
- QR 코드 스캔 화면 나타남

## ✅ 성공 기준

### 완전한 Standalone 앱의 특징:
1. **독립 실행**: Metro 서버 불필요
2. **오프라인 작동**: 인터넷 연결 없이 모든 기능 사용
3. **네이티브 성능**: 60fps 애니메이션, 빠른 시작
4. **앱스토어 배포 가능**: 상용화 수준의 품질
5. **완전한 UI**: ChessNote 고유 인터페이스만 표시

## 🔧 문제 발생 시 해결 순서

### 1단계: 설정 검사
```bash
# eas.json의 developmentClient 설정 확인
grep -A 3 -B 3 "developmentClient" eas.json
# 모든 값이 false여야 함
```

### 2단계: 네이티브 프로젝트 재생성
```bash
# 필요시 네이티브 프로젝트 클린 빌드
npx expo prebuild --platform ios --clean
```

### 3단계: Xcode 빌드
```bash
cd ios
open ChessNote.xcworkspace
# Release 모드로 실기기에 빌드
```

### 4단계: 검증
- 실기기에서 앱 독립 실행 확인
- 모든 체스 기능 정상 작동 확인
- Metro 서버 종료 후에도 정상 동작 확인

## 📝 빌드 기록 템플릿

```
빌드 날짜: [YYYY-MM-DD]
빌드 타입: iOS Standalone
버전: [앱 버전]
확인 사항:
- [ ] developmentClient: false 설정됨
- [ ] Release 모드 빌드
- [ ] 실기기에서 독립 실행 확인
- [ ] 모든 기능 정상 작동
- [ ] Metro 서버 불필요 확인
```

## 🎯 목표

**최종 목표**: 사용자가 실기기 빌드를 요청할 때마다, 항상 완전한 standalone 앱을 제공하여 iPhone에서 완전히 독립적으로 실행되도록 보장.

---

**🔒 이 정책은 모든 iOS 실기기 빌드에 적용됩니다.**