import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import React, { useEffect } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { GameProvider } from './src/context/GameContext';
import { NavigationProvider, useNavigation } from './src/context/NavigationContext';
import { HomeScreen, WriteModeScreen, AnalysisModeScreen } from './src/screens';

// 메인 앱 컨테이너 (NavigationProvider 내부)
const AppContainer: React.FC = () => {
  const { currentScreen } = useNavigation();

  // 현재 화면에 따라 적절한 스크린 렌더링
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen />;
      case 'write':
        return <WriteModeScreen />;
      case 'analysis':
        return <AnalysisModeScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return renderCurrentScreen();
};

// 메인 앱 컴포넌트
export default function App() {
  useEffect(() => {
    // 앱이 시작될 때 화면 꺼짐 방지 활성화
    const enableKeepAwake = async () => {
      await activateKeepAwakeAsync();
    };

    enableKeepAwake();

    // 앱이 종료될 때 정리
    return () => {
      deactivateKeepAwake();
    };
  }, []);

  return (
    <PaperProvider>
      <NavigationProvider>
        <GameProvider>
          <AppContainer />
        </GameProvider>
      </NavigationProvider>
    </PaperProvider>
  );
}