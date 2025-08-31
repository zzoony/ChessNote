import 'react-native-gesture-handler';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import React, { useEffect } from 'react';
import { GameProvider } from './src/context/GameContext';
import { PuzzleProvider } from './src/context/PuzzleContext';
import { AIProvider } from './src/context/AIContext';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

// 메인 앱 컴포넌트
export default function App() {
  useEffect(() => {
    // 앱이 시작될 때 화면 꺼짐 방지 활성화
    const enableKeepAwake = async () => {
      await activateKeepAwakeAsync();
    };

    enableKeepAwake();

    // 앱이 종료될 때 정리 (선택사항)
    return () => {
      deactivateKeepAwake();
    };
  }, []);

  return (
    <ThemeProvider>
      <GameProvider>
        <PuzzleProvider>
          <AIProvider>
            <AppNavigator />
          </AIProvider>
        </PuzzleProvider>
      </GameProvider>
    </ThemeProvider>
  );
}