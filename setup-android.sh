#!/bin/bash

# ChessNote Android 빌드 환경 설정 스크립트
# 다른 컴퓨터에서 clone 후 실행하여 빌드 환경을 자동 설정

echo "🚀 ChessNote Android 빌드 환경 설정을 시작합니다..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 에러 체크 함수
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✅ $1이 설치되어 있습니다.${NC}"
        return 0
    else
        echo -e "${RED}❌ $1이 설치되지 않았습니다.${NC}"
        return 1
    fi
}

# 환경 변수 체크 함수
check_env_var() {
    if [ -z "${!1}" ]; then
        echo -e "${RED}❌ 환경변수 $1이 설정되지 않았습니다.${NC}"
        return 1
    else
        echo -e "${GREEN}✅ 환경변수 $1: ${!1}${NC}"
        return 0
    fi
}

echo ""
echo "📋 1단계: 필수 소프트웨어 확인"
echo "================================"

# Node.js 확인
if check_command "node"; then
    NODE_VERSION=$(node -v)
    echo "   Node.js 버전: $NODE_VERSION"
fi

# npm 확인
if check_command "npm"; then
    NPM_VERSION=$(npm -v)
    echo "   npm 버전: $NPM_VERSION"
fi

# Java 확인
if check_command "java"; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1 | awk -F '"' '{print $2}')
    echo "   Java 버전: $JAVA_VERSION"
fi

echo ""
echo "🔧 2단계: Android 환경 확인"
echo "========================="

# ANDROID_HOME 확인 및 설정
if [ -z "$ANDROID_HOME" ]; then
    echo -e "${YELLOW}⚠️ ANDROID_HOME이 설정되지 않았습니다.${NC}"
    
    # 일반적인 Android SDK 경로들 확인
    POSSIBLE_PATHS=(
        "$HOME/Library/Android/sdk"
        "$HOME/Android/Sdk"
        "/usr/local/android-sdk"
        "/opt/android-sdk"
    )
    
    for path in "${POSSIBLE_PATHS[@]}"; do
        if [ -d "$path" ]; then
            echo -e "${GREEN}Android SDK를 발견했습니다: $path${NC}"
            export ANDROID_HOME="$path"
            break
        fi
    done
    
    if [ -z "$ANDROID_HOME" ]; then
        echo -e "${RED}❌ Android SDK를 찾을 수 없습니다. 수동으로 설치하거나 ANDROID_HOME을 설정해주세요.${NC}"
        echo "   참고: https://developer.android.com/studio"
        exit 1
    fi
else
    echo -e "${GREEN}✅ ANDROID_HOME: $ANDROID_HOME${NC}"
fi

# PATH에 Android 도구 추가
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools

# adb 확인
if check_command "adb"; then
    ADB_VERSION=$(adb version 2>&1 | head -n 1)
    echo "   ADB: $ADB_VERSION"
fi

echo ""
echo "📦 3단계: 프로젝트 의존성 설치"
echo "============================"

# npm 의존성 설치
echo "npm 패키지를 설치합니다..."
npm install

# peer dependency 확인 및 설치
echo "필수 peer dependency를 확인합니다..."
npx expo install react-native-safe-area-context

echo ""
echo "🏗️ 4단계: local.properties 생성"
echo "==============================="

# local.properties 파일 생성 (사용자별 Android SDK 경로)
if [ ! -f "android/local.properties" ]; then
    echo "android/local.properties 파일을 생성합니다..."
    echo "sdk.dir=$ANDROID_HOME" > android/local.properties
    echo -e "${GREEN}✅ local.properties 파일이 생성되었습니다.${NC}"
else
    echo -e "${YELLOW}⚠️ local.properties 파일이 이미 존재합니다.${NC}"
fi

echo ""
echo "🧪 5단계: 환경 검증"
echo "=================="

# TypeScript 컴파일 테스트
echo "TypeScript 컴파일을 테스트합니다..."
if npx tsc --noEmit; then
    echo -e "${GREEN}✅ TypeScript 컴파일 성공${NC}"
else
    echo -e "${RED}❌ TypeScript 컴파일 실패${NC}"
fi

# Expo doctor 실행
echo "Expo 프로젝트 상태를 확인합니다..."
npx expo-doctor || echo -e "${YELLOW}⚠️ Expo doctor에서 경고가 발생했지만 계속 진행합니다.${NC}"

echo ""
echo "🎯 설정 완료!"
echo "============"
echo -e "${GREEN}ChessNote Android 빌드 환경이 준비되었습니다!${NC}"
echo ""
echo "다음 명령으로 APK를 빌드할 수 있습니다:"
echo "  cd android && ./gradlew assembleRelease"
echo "  cd .. && cp android/app/build/outputs/apk/release/app-release.apk ChessNote.apk"
echo ""
echo "또는 개발 서버를 시작하려면:"
echo "  npx expo start --port 8081"
echo ""
echo "💡 참고: APK 빌드 후 항상 ChessNote.apk 파일을 프로젝트 루트에 생성하세요 (쉬운 접근)"
echo "문제가 발생하면 ANDROID_BUILD_GUIDE.md를 참고하세요."