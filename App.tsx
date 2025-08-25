import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { GameProvider, useGame } from './src/context/GameContext';
import ChessBoard from './src/components/ChessBoard';
import GameNotation from './src/components/GameNotation';
import GameControls from './src/components/Controls';

// 메인 게임 컴포넌트 (GameProvider 내부)
const GameScreen: React.FC = () => {
  const { gameState, position, makeMove } = useGame();

  const handleMove = (from: string, to: string) => {
    const success = makeMove(from, to);
    if (success) {
      console.log(`기물 이동: ${from} → ${to}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* 앱 제목 */}
      <View style={styles.header}>
        <Text style={styles.title}>체스기보</Text>
        <Text style={styles.subtitle}>ChessNote</Text>
      </View>
      
      {/* 체스보드 */}
      <View style={styles.boardContainer}>
        <ChessBoard 
          position={position}
          onMove={handleMove} 
        />
      </View>
      
      {/* 기보 표시 */}
      <View style={styles.notationContainer}>
        <GameNotation moves={gameState.moves} />
      </View>
      
      {/* 제어 버튼들 */}
      <GameControls />
    </SafeAreaView>
  );
};

// 메인 앱 컴포넌트
export default function App() {
  return (
    <GameProvider>
      <GameScreen />
    </GameProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#312e2b',
  },
  header: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.8,
  },
  boardContainer: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  notationContainer: {
    flex: 1,
    margin: 20,
  },
});