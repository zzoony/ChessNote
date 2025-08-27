# ChessNote iOS 실기기 빌드 최종 가이드 (영구보존용)

## 🎯 검증 완료 (2025-08-27)

이 문서는 ChessNote 앱을 **완전한 standalone iOS 앱**으로 빌드하는 검증된 방법을 기록합니다.

## 🚀 성공한 빌드 방법

### 1단계: AppDelegate.swift 설정 (핵심)

`ios/ChessNote/AppDelegate.swift` 파일이 다음과 같이 설정되어 있어야 합니다:

```swift
import UIKit
import React

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, RCTBridgeDelegate {
  var window: UIWindow?
  var bridge: RCTBridge!

  func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    
    bridge = RCTBridge(delegate: self, launchOptions: launchOptions)
    let rootView = RCTRootView(bridge: bridge!, moduleName: "main", initialProperties: nil)
    
    if #available(iOS 13.0, *) {
      rootView.backgroundColor = UIColor.systemBackground
    } else {
      rootView.backgroundColor = UIColor.white
    }
    
    window = UIWindow(frame: UIScreen.main.bounds)
    let rootViewController = UIViewController()
    rootViewController.view = rootView
    window?.rootViewController = rootViewController
    window?.makeKeyAndVisible()
    
    return true
  }

  // MARK: - RCTBridgeDelegate

  func sourceURL(for bridge: RCTBridge!) -> URL! {
#if DEBUG
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")
#else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }

  // MARK: - Linking API
  
  func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
    return RCTLinkingManager.application(app, open: url, options: options)
  }

  // MARK: - Universal Links
  
  func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
    return RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
  }
}
```

**중요**: ExpoAppDelegate, ExpoReactNativeFactory 등의 Expo 개발 클라이언트 코드는 절대 사용하지 않습니다.

### 2단계: eas.json 설정 확인

```json
{
  "build": {
    "development": {
      "developmentClient": false,
      "distribution": "internal"
    },
    "preview": {
      "developmentClient": false,
      "distribution": "internal"
    },
    "production": {
      "developmentClient": false,
      "distribution": "store"
    }
  }
}
```

### 3단계: 검증된 빌드 프로세스

```bash
# 1. 프로젝트 디렉토리로 이동
cd /Users/peter/Dev/ChessNote

# 2. iOS 디렉토리로 이동
cd ios

# 3. CocoaPods 의존성 재설치 (매우 중요)
pod install

# 4. Xcode Workspace 열기
open ChessNote.xcworkspace
```

### 4단계: Xcode 설정 및 빌드

**Xcode에서 다음 단계를 정확히 따라주세요:**

1. **Target 선택**: ChessNote
2. **Device 선택**: 실제 iPhone (시뮬레이터 아님)
3. **Scheme 설정**:
   - Product → Scheme → Edit Scheme...
   - Run → Build Configuration: **Release** (매우 중요)
4. **서명 설정**:
   - ChessNote 타겟 → Signing & Capabilities
   - Team 선택, Bundle Identifier 확인
5. **빌드 및 실행**:
   - ⌘ + R (Build and Run)

## ✅ 성공 확인 방법

### 정상적인 standalone 앱의 특징:
- ✅ ChessNote 고유 스플래시 화면
- ✅ 체스보드가 바로 표시됨
- ✅ Metro 서버 없이 완전히 독립 실행
- ✅ 모든 체스 기능 정상 작동
- ✅ 완전한 오프라인 작동

### 실패한 빌드의 신호:
- ❌ Expo Go 개발 화면 표시
- ❌ Metro 서버가 필요함
- ❌ QR 코드나 개발 메뉴 표시

## 🔧 문제 발생 시 해결책

### Expo Go 화면이 나타나는 경우:
1. AppDelegate.swift가 위의 코드와 정확히 일치하는지 확인
2. `pod install` 다시 실행
3. Xcode에서 Clean Build Folder (⌘ + Shift + K)
4. Release 모드로 다시 빌드

### 빌드 에러가 발생하는 경우:
```bash
# 캐시 정리
cd /Users/peter/Dev/ChessNote
npx expo start --clear

# iOS 빌드 폴더 정리
cd ios
xcodebuild clean -workspace ChessNote.xcworkspace -scheme ChessNote

# CocoaPods 재설치
pod install
```

## 📝 변경 이력

**2025-08-27**: 
- AppDelegate.swift를 완전한 standalone 구성으로 수정
- ExpoAppDelegate → UIResponder, UIApplicationDelegate로 변경
- 검증 완료: iPhone에서 독립 실행 성공

## 🎯 이 가이드의 목적

**영구적인 참고자료**: 
- 앞으로 모든 iOS 실기기 빌드는 이 방법을 사용
- Context가 clear되어도 이 문서를 참조하여 동일한 방법 적용
- 완전한 standalone 앱 보장

---

**🔒 이 가이드는 ChessNote 프로젝트의 영구 보존 문서입니다.**