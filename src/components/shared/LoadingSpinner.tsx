import React, { useRef, useEffect } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium',
  color 
}) => {
  const { currentTheme } = useTheme();
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    };

    startAnimation();
  }, [rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const sizes = {
    small: 20,
    medium: 30,
    large: 40,
  };

  const spinnerSize = sizes[size];
  const spinnerColor = color || currentTheme.colors.primary;

  return (
    <View style={[styles.container, { width: spinnerSize, height: spinnerSize }]}>
      <Animated.View
        style={[
          styles.spinner,
          {
            width: spinnerSize,
            height: spinnerSize,
            borderColor: `${spinnerColor}30`,
            borderTopColor: spinnerColor,
            borderWidth: spinnerSize / 10,
            borderRadius: spinnerSize / 2,
            transform: [{ rotate: spin }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    // Animated properties will be applied dynamically
  },
});

export default LoadingSpinner;