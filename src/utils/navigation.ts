// Navigation utilities for ChessNote app

import { NavigationState, NavigationAction, ScreenName } from '../types/navigation';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';

export const navigationReducer = (
  state: NavigationState,
  action: NavigationAction
): NavigationState => {
  switch (action.type) {
    case 'NAVIGATE':
      if (action.payload?.screen) {
        return {
          currentScreen: action.payload.screen,
          history: [...state.history, state.currentScreen],
        };
      }
      return state;

    case 'GO_BACK':
      const previousScreen = state.history[state.history.length - 1];
      if (previousScreen) {
        return {
          currentScreen: previousScreen,
          history: state.history.slice(0, -1),
        };
      }
      return state;

    case 'RESET':
      return {
        currentScreen: action.payload?.screen || 'MainMenu',
        history: [],
      };

    default:
      return state;
  }
};

export const createNavigationHelpers = (dispatch: React.Dispatch<NavigationAction>) => ({
  navigate: (screen: ScreenName, params?: any) => {
    dispatch({
      type: 'NAVIGATE',
      payload: { screen, params },
    });
  },
  
  goBack: () => {
    dispatch({ type: 'GO_BACK' });
  },
  
  reset: (screen: ScreenName = 'MainMenu') => {
    dispatch({
      type: 'RESET',
      payload: { screen },
    });
  },
});

// 게임 공유 함수
export const shareGame = async (pgn: string, filename: string = 'game.pgn'): Promise<void> => {
  try {
    // 임시 파일 생성
    const fileUri = FileSystem.documentDirectory + filename;
    await FileSystem.writeAsStringAsync(fileUri, pgn);
    
    // 공유 가능한지 확인
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/x-chess-pgn',
        dialogTitle: '게임 공유',
      });
    } else {
      Alert.alert('알림', '이 기기에서는 파일 공유가 지원되지 않습니다.');
    }
    
    // 임시 파일 삭제
    await FileSystem.deleteAsync(fileUri, { idempotent: true });
  } catch (error) {
    console.error('Share game error:', error);
    throw new Error('게임 공유에 실패했습니다.');
  }
};