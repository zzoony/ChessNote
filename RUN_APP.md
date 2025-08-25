# 체스기보 앱 실행 방법

## 🎯 완성된 앱 실행하기

### 방법 1: Expo Go 앱 (추천 🌟)

1. **스마트폰에 Expo Go 앱 설치**
   - iOS: App Store에서 "Expo Go" 검색 후 설치
   - Android: Play Store에서 "Expo Go" 검색 후 설치

2. **개발 서버 시작**
   ```bash
   npx expo start
   ```

3. **QR 코드 스캔**
   - 터미널에 나타나는 QR 코드를 Expo Go 앱으로 스캔
   - 또는 같은 WiFi에서 `exp://192.168.x.x:19000` 직접 입력

### 방법 2: iOS 시뮬레이터

1. **Xcode 설치** (Mac에서만 가능)
2. **iOS 시뮬레이터 실행**
   ```bash
   npx expo run:ios
   ```

### 방법 3: Android 에뮬레이터

1. **Android Studio 설치**
2. **Android SDK 설정**
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```
3. **에뮬레이터 실행**
   ```bash
   npx expo run:android
   ```

## 🎮 앱 사용법

### 1. 체스 기물 이동
- 이동할 기물을 터치 → 노란색으로 하이라이트
- 목표 칸을 터치 → 기물 이동

### 2. 기보 확인
- 화면 중간에 실시간 PGN 형식 기보 표시
- 자동으로 이동 번호와 함께 업데이트

### 3. 게임 제어
- **새 게임**: 보드와 기보 초기화
- **되돌리기**: 마지막 이동 취소
- **공유하기**: PGN 파일로 다른 앱에 공유

## 🛠️ 문제 해결

### "EMFILE: too many open files" 에러
```bash
# macOS에서 파일 제한 증가
ulimit -n 4096
# 또는 watchman 설치
brew install watchman
```

### Android SDK 없음
```bash
# Android Studio 설치 후
npx expo install --fix
```

### iOS 개발자 계정 필요
- 실제 iOS 기기에서 실행시 Apple Developer 계정 필요
- 시뮬레이터는 무료로 사용 가능

## ✨ 완성된 기능들

✅ **체스보드**: 8x8 그리드, 모든 기물 표시, 터치 인터랙션
✅ **실시간 기보**: PGN 형식, 한글 인터페이스, 자동 업데이트  
✅ **게임 제어**: 새게임, 되돌리기, 파일 공유
✅ **상태 관리**: React Context로 완전 동기화
✅ **파일 공유**: iOS/Android 네이티브 공유 메뉴 연동

**🎉 완성된 체스기보 앱을 즐겨보세요!**