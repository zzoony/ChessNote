import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { HapticFeedback } from '@/utils/hapticFeedback';

// 테마 타입 정의
export type ThemeName = 'light' | 'dark' | 'classic';
export type BoardTheme = 'classic' | 'modern' | 'wooden' | 'marble';
export type PieceStyle = 'classic' | 'modern' | 'medieval';

export interface Theme {
  name: ThemeName;
  colors: {
    primary: string;
    primaryDark: string;
    secondary: string;
    background: string;
    surface: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    notification: string;
    error: string;
    warning: string;
    success: string;
    // 체스보드 전용 색상
    boardLight: string;
    boardDark: string;
    boardBorder: string;
    selectedSquare: string;
    possibleMove: string;
    lastMove: string;
    check: string;
    // UI 요소 색상
    buttonPrimary: string;
    buttonSecondary: string;
    modalBackground: string;
    overlayBackground: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
  };
  shadows: {
    small: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    medium: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
  };
}

// 라이트 테마
const lightTheme: Theme = {
  name: 'light',
  colors: {
    primary: '#2196F3',
    primaryDark: '#1976D2',
    secondary: '#FF9800',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    card: '#FFFFFF',
    text: '#212121',
    textSecondary: '#757575',
    border: '#E0E0E0',
    notification: '#FF5722',
    error: '#F44336',
    warning: '#FF9800',
    success: '#4CAF50',
    // 체스보드
    boardLight: '#F0D9B5',
    boardDark: '#B58863',
    boardBorder: '#8B4513',
    selectedSquare: '#FFEB3B',
    possibleMove: '#81C784',
    lastMove: '#FFB74D',
    check: '#F44336',
    // UI 요소
    buttonPrimary: '#2196F3',
    buttonSecondary: '#757575',
    modalBackground: 'rgba(0, 0, 0, 0.5)',
    overlayBackground: 'rgba(255, 255, 255, 0.9)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
      elevation: 3,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
  },
};

// 다크 테마
const darkTheme: Theme = {
  ...lightTheme,
  name: 'dark',
  colors: {
    ...lightTheme.colors,
    primary: '#90CAF9',
    primaryDark: '#42A5F5',
    background: '#121212',
    surface: '#1E1E1E',
    card: '#2C2C2C',
    text: '#FFFFFF',
    textSecondary: '#B3B3B3',
    border: '#333333',
    // 체스보드 (다크 모드에서도 전통적인 색상 유지)
    boardLight: '#F0D9B5',
    boardDark: '#B58863',
    boardBorder: '#8B4513',
    selectedSquare: '#FFEB3B',
    possibleMove: '#66BB6A',
    lastMove: '#FFA726',
    check: '#EF5350',
    // UI 요소
    buttonPrimary: '#90CAF9',
    buttonSecondary: '#757575',
    modalBackground: 'rgba(0, 0, 0, 0.8)',
    overlayBackground: 'rgba(18, 18, 18, 0.9)',
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.35,
      shadowRadius: 2.22,
      elevation: 3,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 3.84,
      elevation: 5,
    },
  },
};

// 클래식 테마 (기존 스타일과 유사)
const classicTheme: Theme = {
  ...lightTheme,
  name: 'classic',
  colors: {
    ...lightTheme.colors,
    primary: '#4CAF50',
    primaryDark: '#388E3C',
    background: '#1a1a1a',
    surface: '#2a2a2a',
    card: '#252525',
    text: '#ffffff',
    textSecondary: '#aaa',
    border: '#333',
    // 체스보드
    boardLight: '#F0D9B5',
    boardDark: '#B58863',
    boardBorder: '#8B4513',
    selectedSquare: '#FFEB3B',
    possibleMove: '#81C784',
    lastMove: '#FFB74D',
    check: '#F44336',
    // UI 요소
    buttonPrimary: '#4CAF50',
    buttonSecondary: '#666',
    modalBackground: 'rgba(0, 0, 0, 0.7)',
    overlayBackground: 'rgba(26, 26, 26, 0.9)',
  },
};

// 보드 테마 설정
export const boardThemes: Record<BoardTheme, { light: string; dark: string; border: string }> = {
  classic: {
    light: '#F0D9B5',
    dark: '#B58863',
    border: '#8B4513',
  },
  modern: {
    light: '#EEEEEE',
    dark: '#777777',
    border: '#555555',
  },
  wooden: {
    light: '#DEB887',
    dark: '#8B7355',
    border: '#654321',
  },
  marble: {
    light: '#F5F5DC',
    dark: '#D2B48C',
    border: '#A0522D',
  },
};

// 설정 인터페이스
export interface UserSettings {
  theme: ThemeName;
  boardTheme: BoardTheme;
  pieceStyle: PieceStyle;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  language: 'ko' | 'en';
  hapticFeedbackEnabled: boolean;
}

// 기본 설정
const defaultSettings: UserSettings = {
  theme: 'classic',
  boardTheme: 'classic',
  pieceStyle: 'classic',
  soundEnabled: true,
  animationsEnabled: true,
  language: 'ko',
  hapticFeedbackEnabled: true,
};

// 테마 액션 타입
type ThemeAction =
  | { type: 'SET_THEME'; payload: ThemeName }
  | { type: 'SET_BOARD_THEME'; payload: BoardTheme }
  | { type: 'SET_PIECE_STYLE'; payload: PieceStyle }
  | { type: 'SET_SOUND_ENABLED'; payload: boolean }
  | { type: 'SET_ANIMATIONS_ENABLED'; payload: boolean }
  | { type: 'SET_LANGUAGE'; payload: 'ko' | 'en' }
  | { type: 'SET_HAPTIC_FEEDBACK'; payload: boolean }
  | { type: 'LOAD_SETTINGS'; payload: UserSettings }
  | { type: 'RESET_SETTINGS' };

// 테마 상태 인터페이스
interface ThemeState {
  currentTheme: Theme;
  settings: UserSettings;
  isLoading: boolean;
}

// 테마 컨텍스트 타입
interface ThemeContextType extends ThemeState {
  setTheme: (theme: ThemeName) => void;
  setBoardTheme: (boardTheme: BoardTheme) => void;
  setPieceStyle: (pieceStyle: PieceStyle) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  setLanguage: (language: 'ko' | 'en') => void;
  setHapticFeedback: (enabled: boolean) => void;
  resetSettings: () => void;
  getBoardColors: () => { light: string; dark: string; border: string };
  saveSettings: () => Promise<void>;
}

// 테마 선택 함수
const getTheme = (themeName: ThemeName): Theme => {
  switch (themeName) {
    case 'light':
      return lightTheme;
    case 'dark':
      return darkTheme;
    case 'classic':
    default:
      return classicTheme;
  }
};

// 리듀서
const themeReducer = (state: ThemeState, action: ThemeAction): ThemeState => {
  switch (action.type) {
    case 'SET_THEME': {
      const newSettings = { ...state.settings, theme: action.payload };
      return {
        ...state,
        currentTheme: getTheme(action.payload),
        settings: newSettings,
      };
    }
    case 'SET_BOARD_THEME':
      return {
        ...state,
        settings: { ...state.settings, boardTheme: action.payload },
      };
    case 'SET_PIECE_STYLE':
      return {
        ...state,
        settings: { ...state.settings, pieceStyle: action.payload },
      };
    case 'SET_SOUND_ENABLED':
      return {
        ...state,
        settings: { ...state.settings, soundEnabled: action.payload },
      };
    case 'SET_ANIMATIONS_ENABLED':
      return {
        ...state,
        settings: { ...state.settings, animationsEnabled: action.payload },
      };
    case 'SET_LANGUAGE':
      return {
        ...state,
        settings: { ...state.settings, language: action.payload },
      };
    case 'SET_HAPTIC_FEEDBACK':
      // 햅틱 피드백 설정 동기화
      HapticFeedback.setEnabled(action.payload);
      return {
        ...state,
        settings: { ...state.settings, hapticFeedbackEnabled: action.payload },
      };
    case 'LOAD_SETTINGS': {
      const newSettings = action.payload;
      // 햅틱 피드백 설정 동기화
      HapticFeedback.setEnabled(newSettings.hapticFeedbackEnabled);
      return {
        ...state,
        currentTheme: getTheme(newSettings.theme),
        settings: newSettings,
        isLoading: false,
      };
    }
    case 'RESET_SETTINGS': {
      return {
        ...state,
        currentTheme: getTheme(defaultSettings.theme),
        settings: defaultSettings,
      };
    }
    default:
      return state;
  }
};

// 초기 상태
const initialState: ThemeState = {
  currentTheme: getTheme(defaultSettings.theme),
  settings: defaultSettings,
  isLoading: true,
};

// 컨텍스트 생성
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 저장소 키
const SETTINGS_KEY = '@ChessNote_Settings';

// Provider 컴포넌트
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // 설정 로드
  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        const settings: UserSettings = JSON.parse(savedSettings);
        dispatch({ type: 'LOAD_SETTINGS', payload: settings });
      } else {
        dispatch({ type: 'LOAD_SETTINGS', payload: defaultSettings });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      dispatch({ type: 'LOAD_SETTINGS', payload: defaultSettings });
    }
  };

  // 설정 저장
  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  // 컴포넌트 마운트 시 설정 로드
  useEffect(() => {
    loadSettings();
  }, []);

  // 설정 변경 시 자동 저장
  useEffect(() => {
    if (!state.isLoading) {
      saveSettings();
    }
  }, [state.settings, state.isLoading]);

  // 액션 함수들
  const setTheme = (theme: ThemeName) => {
    dispatch({ type: 'SET_THEME', payload: theme });
  };

  const setBoardTheme = (boardTheme: BoardTheme) => {
    dispatch({ type: 'SET_BOARD_THEME', payload: boardTheme });
  };

  const setPieceStyle = (pieceStyle: PieceStyle) => {
    dispatch({ type: 'SET_PIECE_STYLE', payload: pieceStyle });
  };

  const setSoundEnabled = (enabled: boolean) => {
    dispatch({ type: 'SET_SOUND_ENABLED', payload: enabled });
  };

  const setAnimationsEnabled = (enabled: boolean) => {
    dispatch({ type: 'SET_ANIMATIONS_ENABLED', payload: enabled });
  };

  const setLanguage = (language: 'ko' | 'en') => {
    dispatch({ type: 'SET_LANGUAGE', payload: language });
  };

  const setHapticFeedback = (enabled: boolean) => {
    dispatch({ type: 'SET_HAPTIC_FEEDBACK', payload: enabled });
  };

  const resetSettings = () => {
    dispatch({ type: 'RESET_SETTINGS' });
  };

  // 현재 보드 테마 색상 반환
  const getBoardColors = () => {
    return boardThemes[state.settings.boardTheme];
  };

  const value: ThemeContextType = {
    ...state,
    setTheme,
    setBoardTheme,
    setPieceStyle,
    setSoundEnabled,
    setAnimationsEnabled,
    setLanguage,
    setHapticFeedback,
    resetSettings,
    getBoardColors,
    saveSettings,
  };

  // Status Bar 스타일 결정
  const statusBarStyle = state.currentTheme.name === 'light' ? 'dark' : 'light';

  return (
    <ThemeContext.Provider value={value}>
      <StatusBar style={statusBarStyle} />
      {children}
    </ThemeContext.Provider>
  );
};

// Hook
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// 편의 함수들
export const getThemeColors = (theme: Theme) => theme.colors;
export const getThemeSpacing = (theme: Theme) => theme.spacing;
export const getThemeBorderRadius = (theme: Theme) => theme.borderRadius;
export const getThemeShadows = (theme: Theme) => theme.shadows;