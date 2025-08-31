// Navigation types for ChessNote app
import type { StackScreenProps } from '@react-navigation/stack';
import type { NavigationProp } from '@react-navigation/native';

export type RootStackParamList = {
  MainMenu: undefined;
  NotationMode: undefined;
  ReviewMode: undefined;
  PuzzleMode: undefined;
  AIMode: undefined;
  Settings: undefined;
};

export type ScreenName = keyof RootStackParamList;

// Navigation prop types for each screen
export type MainMenuScreenProps = StackScreenProps<RootStackParamList, 'MainMenu'>;
export type NotationModeScreenProps = StackScreenProps<RootStackParamList, 'NotationMode'>;
export type ReviewModeScreenProps = StackScreenProps<RootStackParamList, 'ReviewMode'>;
export type PuzzleModeScreenProps = StackScreenProps<RootStackParamList, 'PuzzleMode'>;
export type AIModeScreenProps = StackScreenProps<RootStackParamList, 'AIMode'>;
export type SettingsScreenProps = StackScreenProps<RootStackParamList, 'Settings'>;

// General navigation prop type
export type RootStackNavigationProp = NavigationProp<RootStackParamList>;

// Legacy types for backwards compatibility
export interface NavigationState {
  currentScreen: ScreenName;
  history: ScreenName[];
}

export interface NavigationAction {
  type: 'NAVIGATE' | 'GO_BACK' | 'RESET';
  payload?: {
    screen?: ScreenName;
    params?: any;
  };
}