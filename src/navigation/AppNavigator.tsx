import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import type { RootStackParamList } from '../types/navigation';
import { useTheme } from '../context/ThemeContext';

// Screen imports
import MainMenuScreen from '../screens/MainMenuScreen';
import NotationModeScreen from '../screens/NotationModeScreen';
import ReviewModeScreen from '../screens/ReviewModeScreen';
import PuzzleModeScreen from '../screens/PuzzleModeScreen';
import AIModeScreen from '../screens/AIModeScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { currentTheme } = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainMenu"
        screenOptions={{
          headerStyle: {
            backgroundColor: currentTheme.colors.surface,
            borderBottomColor: currentTheme.colors.border,
          },
          headerTintColor: currentTheme.colors.primary,
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
            color: currentTheme.colors.text,
          },
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          gestureEnabled: true,
        }}
      >
        <Stack.Screen
          name="MainMenu"
          component={MainMenuScreen}
          options={{
            headerShown: false, // MainMenu에서는 헤더 숨김
          }}
        />
        <Stack.Screen
          name="NotationMode"
          component={NotationModeScreen}
          options={{
            title: 'ChessNote',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="ReviewMode"
          component={ReviewModeScreen}
          options={{
            title: 'PGN Review',
            headerShown: false, // ReviewModeScreen에서 자체 헤더 사용
          }}
        />
        <Stack.Screen
          name="PuzzleMode"
          component={PuzzleModeScreen}
          options={{
            title: 'Puzzle Mode',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="AIMode"
          component={AIModeScreen}
          options={{
            title: 'AI 대전',
            headerShown: false, // AIModeScreen에서 자체 헤더 사용
          }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: '설정',
            headerShown: false, // SettingsScreen에서 자체 헤더 사용
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}