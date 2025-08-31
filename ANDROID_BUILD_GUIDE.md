# Android 빌드 가이드 - ChessNote 프로젝트

Claude Code에서 안드로이드 빌드를 수행할 때 반드시 지켜야 할 규칙과 절차를 정의한 문서입니다.

## 📋 프로젝트 환경 요구사항

### 필수 소프트웨어 버전
```yaml
Node.js: v24.6.0
npm: 11.5.1
Expo CLI: 0.24.21
Java: OpenJDK 17.0.16 (Homebrew)
Android SDK: /Users/peter/Library/Android/sdk
React Native: 0.79.5
Expo SDK: 53.0.22
TypeScript: 5.8.3
```

### 프로젝트 정보
```yaml
프로젝트명: ChessNote (체스기보 모바일 앱)
패키지명: com.chessnote.app
앱명: 체스노트
버전: 1.1.0
```

## 🛠️ 빌드 환경 설정

### 1. 환경 변수 설정 (필수)
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools
```

### 2. 프로젝트 디렉토리
```bash
cd /Users/peter/Dev/Projects/ChessNote
```

### 3. 필수 파일 확인
- `package.json`: 의존성 및 스크립트 정의
- `app.json`: Expo 앱 구성
- `eas.json`: EAS Build 구성
- `android/app/build.gradle`: 안드로이드 앱 빌드 설정
- `android/build.gradle`: 전체 안드로이드 프로젝트 설정

## 🚀 빌드 방법별 가이드

### Method 1: 로컬 Gradle 빌드 (★ 권장 - 검증됨)
```bash
# 1. 프로젝트 디렉토리로 이동
cd /Users/peter/Dev/Projects/ChessNote

# 2. 환경 변수 설정 (필수)
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools

# 3. 의존성 설치 및 확인
npm install
npx expo install react-native-safe-area-context  # 필수 peer dependency

# 4. Release APK 빌드 (standalone)
cd android && ./gradlew assembleRelease

# 5. APK 복사 및 이름 변경
cd .. && cp app/build/outputs/apk/release/app-release.apk ChessNote.apk

# 빌드 결과: 완전한 standalone APK (90MB, 독립 실행 가능)
```

### Method 2: Expo Development Build (개발용)
```bash
# 1. 개발 서버 시작
npx expo start --port 8081

# 2. 안드로이드 에뮬레이터에서 실행
# Expo Go 앱에서 QR 코드 스캔 또는
# 터미널에서 'a' 키 입력하여 안드로이드 실행
```

### Method 3: EAS Build (클라우드 빌드 - 계정 필요)
```bash
# 1. EAS 로그인
npx eas login

# 2. 개발용 APK 빌드
npx eas build -p android --profile development

# 3. 미리보기용 APK 빌드  
npx eas build -p android --profile preview

# 4. 프로덕션용 AAB 빌드
npx eas build -p android --profile production
```

## ⚠️ 알려진 이슈 및 해결책

### 1. 필수 의존성 누락 오류
**증상**: `Missing peer dependency: react-native-safe-area-context`

**해결책** (★ 중요):
```bash
# 필수 peer dependency 설치
npx expo install react-native-safe-area-context

# expo-doctor로 의존성 확인
npx expo-doctor
```

### 2. NDK 관련 오류
**증상**: `Android NDK: ERROR: You should not be invoking ndk-build when using the Gradle plugin` 또는 NDK 버전 불일치

**해결책**:
```bash
# A. 로컬 Gradle 빌드 사용 (권장)
cd android && ./gradlew assembleRelease

# B. 개발 서버 사용 (개발용)
npx expo start --port 8081

# C. NDK 경로 확인 및 재설정
echo $ANDROID_HOME/ndk
```

### 3. 포트 충돌 문제
**증상**: `Port 8081 already in use`

**해결책**:
```bash
# 다른 포트 사용
npx expo start --port 8082

# 또는 기존 프로세스 종료
lsof -ti:8081 | xargs kill -9
```

### 3. Metro 캐시 문제
**증상**: 패키지 변경 후 빌드 오류

**해결책**:
```bash
# Metro 캐시 클리어
npx expo start --clear

# 또는 node_modules 재설치
rm -rf node_modules package-lock.json
npm install
```

### 4. 에뮬레이터 연결 문제
**증상**: 에뮬레이터가 인식되지 않음

**해결책**:
```bash
# 1. 에뮬레이터 상태 확인
adb devices

# 2. ADB 서버 재시작
adb kill-server
adb start-server

# 3. 에뮬레이터 재시작
emulator -avd Medium_Phone_API_36.0 -wipe-data
```

### 5. Gradle 빌드 오류
**증상**: Gradle 의존성 또는 빌드 오류

**해결책**:
```bash
cd android

# 1. Gradle 캐시 클리어
./gradlew clean

# 2. Gradle 래퍼 재다운로드
./gradlew wrapper --gradle-version=8.0

# 3. 전체 클리어 후 재빌드
rm -rf .gradle build app/build
./gradlew assembleDebug
```

## 📱 테스트 환경

### 권장 안드로이드 에뮬레이터
- **기기**: Medium_Phone_API_36.0
- **API 레벨**: 36 (Android 14.0)
- **아키텍처**: x86_64
- **메모리**: 2048MB

### 실제 기기 테스트
```bash
# 1. USB 디버깅 활성화
# 2. 개발자 옵션 활성화
# 3. 기기 연결 확인
adb devices

# 4. 앱 설치
npx expo run:android --device
```

## 🔧 빌드 설정 세부사항

### EAS Build 프로필
```json
{
  "development": {
    "developmentClient": false,
    "distribution": "internal",
    "android": {
      "resourceClass": "default",
      "buildType": "apk"
    }
  },
  "preview": {
    "developmentClient": false,
    "distribution": "internal",
    "android": {
      "resourceClass": "default", 
      "buildType": "apk"
    }
  },
  "production": {
    "developmentClient": false,
    "distribution": "store",
    "android": {
      "resourceClass": "default",
      "buildType": "aab"
    }
  }
}
```

### 안드로이드 앱 구성
```json
{
  "android": {
    "package": "com.chessnote.app",
    "versionCode": 1,
    "icon": "./assets/icon.png",
    "jsEngine": "jsc",
    "buildNumber": "1.1.0",
    "adaptiveIcon": {
      "foregroundImage": "./assets/adaptive-icon.png",
      "backgroundColor": "#312e2b"
    }
  }
}
```

## 📋 빌드 체크리스트 (2024.08.31 검증)

### 빌드 전 필수 확인사항
- [x] Node.js v24.6.0 설치 확인
- [x] Android SDK 경로 설정 확인 (`$ANDROID_HOME`)
- [x] Java 17 버전 확인
- [x] 프로젝트 의존성 최신 상태 확인 (`npm install`)
- [x] 필수 peer dependency 설치 (`react-native-safe-area-context`)

### 로컬 Gradle 빌드 절차 (검증된 방법)
1. [x] 환경 변수 설정 (`ANDROID_HOME`, `PATH`)
2. [x] 의존성 설치 (`npm install`)
3. [x] Peer dependency 설치 (`npx expo install react-native-safe-area-context`)
4. [x] Release APK 빌드 (`cd android && ./gradlew assembleRelease`)
5. [x] APK 파일 복사 (`cp app/build/outputs/apk/release/app-release.apk ChessNote.apk`)

### 빌드 후 검증사항 (성공 확인)
- [x] APK 파일 생성 확인 (~90MB)
- [x] 패키지 정보 확인 (`com.chessnote.app`, v1.1.0)
- [x] JavaScript 번들 포함 확인 (`assets/index.android.bundle`)
- [x] JSC 엔진 포함 확인 (`libjsc.so`, `libjsi.so`)
- [x] Standalone 실행 가능 확인

## 🎯 빌드 성공 기준 (2024.08.31 달성)

### 성능 기준
- **APK 크기**: ~90MB (Standalone 포함)
- **빌드 시간**: 5-10분 (로컬 환경)
- **빌드 방식**: Release APK (배포 가능)
- **JavaScript 엔진**: JSC (JavaScriptCore)

### 기능 검증 (예상)
- 모든 체스 규칙 정상 동작
- 터치 인터페이스 반응성
- PGN 기보 생성 및 클립보드 공유
- 앱 상태 관리 안정성
- 완전한 오프라인 실행

## 🚨 긴급 복구 절차

### 빌드 완전 실패 시
```bash
# 1. 모든 캐시 클리어
npx expo start --clear
rm -rf node_modules package-lock.json
rm -rf android/.gradle android/build android/app/build

# 2. 의존성 재설치
npm install

# 3. Android SDK 재확인
echo $ANDROID_HOME
# SDK Manager로 필요한 컴포넌트 재설치

# 4. 에뮬레이터 재생성
# Android Studio > AVD Manager > Create Virtual Device

# 5. 단계별 복구 빌드
npx expo doctor  # 환경 진단
npx expo start --port 8081  # 개발 서버만 실행
```

## 📚 참고 자료

### 공식 문서
- [Expo Android 빌드 가이드](https://docs.expo.dev/build-reference/android-builds/)
- [React Native Android 환경 설정](https://reactnative.dev/docs/environment-setup)
- [EAS Build 문서](https://docs.expo.dev/build/introduction/)

### 트러블슈팅 리소스
- [Expo 공통 빌드 문제](https://docs.expo.dev/build-reference/troubleshooting/)
- [Android Studio 에뮬레이터 가이드](https://developer.android.com/studio/run/emulator)

---

## 📈 빌드 성공 사례 (2024.08.31)

### 검증된 빌드 프로세스
```bash
# 성공적인 빌드 커맨드 시퀀스
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools
cd /Users/peter/Dev/Projects/ChessNote
npm install
npx expo install react-native-safe-area-context
cd android && ./gradlew assembleRelease
cd .. && cp app/build/outputs/apk/release/app-release.apk ChessNote.apk
```

### 빌드 결과
- **APK 파일**: `ChessNote.apk` (90,958,837 bytes)
- **패키지**: `com.chessnote.app` v1.1.0 (versionCode: 1)
- **타입**: Standalone APK (완전 독립 실행)
- **JavaScript 번들**: `assets/index.android.bundle` (1.2MB 포함)
- **네이티브 엔진**: JSC (JavaScriptCore) 포함

---

**📝 핵심 성공 요소:**
1. **로컬 Gradle 빌드**: `./gradlew assembleRelease` 방식이 가장 안정적
2. **필수 의존성**: `react-native-safe-area-context` 설치 필수
3. **환경 변수**: `ANDROID_HOME` 및 `PATH` 설정 필수
4. **빌드 결과**: 완전한 standalone APK 생성 확인
5. **검증 도구**: `aapt dump badging`로 패키지 정보 확인

**🎯 목표**: 100% 재현 가능한 빌드 프로세스 확립 완료 ✅