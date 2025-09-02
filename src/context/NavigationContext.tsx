import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AppScreen, NavigationContextType } from '@/types/navigation';

// Context 생성
const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

// Provider 컴포넌트
export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home');

  const navigateToHome = () => {
    setCurrentScreen('home');
  };

  const navigateToWrite = () => {
    setCurrentScreen('write');
  };

  const navigateToAnalysis = () => {
    setCurrentScreen('analysis');
  };

  const value: NavigationContextType = {
    currentScreen,
    navigateToHome,
    navigateToWrite,
    navigateToAnalysis,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

// Hook
export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};