import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useGame } from '@/context/GameContext';

const MoveControls: React.FC = () => {
  const { 
    gameMode, 
    canGoNext, 
    canGoPrevious, 
    currentMoveIndex,
    loadedGame,
    goToStart, 
    goToPrevious, 
    goToNext, 
    goToEnd 
  } = useGame();

  // 분석 모드가 아니면 표시하지 않음
  if (gameMode !== 'analysis' || !loadedGame) {
    return null;
  }

  return (
    <View style={styles.container}>
      <IconButton
        icon="skip-previous"
        size={24}
        disabled={!canGoPrevious}
        onPress={goToStart}
        iconColor={canGoPrevious ? '#4CAF50' : '#666666'}
        style={styles.button}
      />
      
      <IconButton
        icon="chevron-left"
        size={28}
        disabled={!canGoPrevious}
        onPress={goToPrevious}
        iconColor={canGoPrevious ? '#4CAF50' : '#666666'}
        style={styles.button}
      />
      
      <View style={styles.moveCounter}>
        <IconButton
          icon="information"
          size={20}
          disabled
          iconColor="#b0b0b0"
        />
      </View>
      
      <IconButton
        icon="chevron-right"
        size={28}
        disabled={!canGoNext}
        onPress={goToNext}
        iconColor={canGoNext ? '#4CAF50' : '#666666'}
        style={styles.button}
      />
      
      <IconButton
        icon="skip-next"
        size={24}
        disabled={!canGoNext}
        onPress={goToEnd}
        iconColor={canGoNext ? '#4CAF50' : '#666666'}
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2a2724',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  button: {
    margin: 4,
  },
  moveCounter: {
    marginHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MoveControls;