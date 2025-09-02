// 네비게이션 관련 타입 정의

export type AppScreen = 'home' | 'write' | 'analysis';

export interface NavigationState {
  currentScreen: AppScreen;
}

export interface NavigationContextType {
  currentScreen: AppScreen;
  navigateToHome: () => void;
  navigateToWrite: () => void;
  navigateToAnalysis: () => void;
}