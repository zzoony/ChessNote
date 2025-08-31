# Claude Code 프롬프트 - 다른 컴퓨터에서 Android 빌드

다른 컴퓨터에서 Claude Code를 사용해 ChessNote Android APK 빌드 환경을 설정하고 빌드할 때 사용할 프롬프트입니다.

## 🚀 기본 프롬프트 (권장)

```
ChessNote 프로젝트를 clone하고 Android APK 빌드 환경을 설정해줘.

git clone https://github.com/zzoony/ChessNote.git
cd ChessNote
./setup-android.sh

완료되면 APK 빌드도 실행해줘:
cd android && ./gradlew assembleRelease
cd .. && cp android/app/build/outputs/apk/release/app-release.apk ChessNote.apk

각 단계에서 오류가 발생하면 해결책도 제시해줘.
```

## 📝 간단한 프롬프트

```
ChessNote Android APK 빌드를 위해 프로젝트를 clone하고 환경 설정 후 빌드까지 완료해줘. 

GitHub: https://github.com/zzoony/ChessNote.git

ANDROID_BUILD_GUIDE.md의 자동 설정 방법을 따라 ./setup-android.sh를 실행하고, 성공하면 APK도 빌드해줘.
```

## 🔧 환경 설정만 필요한 경우

```
ChessNote 프로젝트에서 Android 빌드 환경을 설정해줘.

./setup-android.sh를 실행하고 모든 환경이 올바르게 설정되었는지 확인해줘. 
오류가 있으면 ANDROID_BUILD_GUIDE.md를 참고해서 해결해줘.
```

## 🏗️ APK 빌드만 필요한 경우

```
ChessNote Android APK를 빌드해줘.

cd android && ./gradlew assembleRelease
cd .. && cp android/app/build/outputs/apk/release/app-release.apk ChessNote.apk

빌드 완료 후 APK 파일 위치와 크기를 알려줘.
```

## ⚡ 원클릭 프롬프트

```
/build android apk

GitHub에서 ChessNote 프로젝트를 clone하고 자동 환경 설정 후 APK 빌드까지 모든 과정을 완료해줘.
```

## 📋 예상 결과물

성공적으로 완료되면 다음과 같은 결과를 얻습니다:

- **프로젝트 위치**: `./ChessNote/` 디렉토리
- **APK 파일**: 
  - `ChessNote/ChessNote.apk` (쉬운 접근)
  - `ChessNote/android/app/build/outputs/apk/release/app-release.apk` (원본)
- **파일 크기**: ~87MB
- **설치 가능**: Android 기기에 직접 설치 가능한 standalone APK

## 🛠️ 알려진 이슈 해결

프롬프트 실행 중 문제가 발생하면 다음을 참고하세요:

### 1. Android SDK 관련 오류
```
ANDROID_HOME 환경변수를 설정하고 다시 시도해줘.
일반적인 경로: $HOME/Library/Android/sdk
```

### 2. Java 버전 오류
```
OpenJDK 17 이상이 필요합니다. Java 버전을 확인하고 업데이트해줘.
```

### 3. 권한 오류
```
setup-android.sh 스크립트에 실행 권한을 부여해줘:
chmod +x setup-android.sh
```

### 4. Gradle 빌드 오류
```
android 디렉토리에서 ./gradlew clean을 실행한 후 다시 빌드해줘.
```

## 📖 추가 참고 자료

- **완전한 빌드 가이드**: `ANDROID_BUILD_GUIDE.md`
- **프로젝트 문서**: `README.md`
- **환경 설정 스크립트**: `setup-android.sh`

## 🎯 성공 기준

다음 조건들이 모두 만족되면 빌드 성공:

- ✅ `./setup-android.sh` 실행 성공
- ✅ `./gradlew assembleRelease` 빌드 성공
- ✅ `ChessNote.apk` 파일 생성 (87MB)
- ✅ TypeScript 컴파일 오류 없음
- ✅ 모든 의존성 설치 완료

---

💡 **팁**: 프롬프트 실행 전에 시스템에 Node.js, Java, Android SDK가 설치되어 있는지 확인하면 더 빠른 진행이 가능합니다.