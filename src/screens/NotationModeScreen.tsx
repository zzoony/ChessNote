import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { useGame } from '../context/GameContext';
import ChessBoard from '../components/ChessBoard';
import GameNotation from '../components/GameNotation';
import GameControls from '../components/Controls';
import CapturedPiecesRow from '../components/CapturedPieces';
import type { NotationModeScreenProps } from '../types/navigation';

const NotationModeScreen: React.FC<NotationModeScreenProps> = ({ navigation }) => {
  const { 
    gameState, 
    position, 
    makeMove, 
    capturedPieces,
    isWhiteInCheck,
    isBlackInCheck,
    isGameOver,
    gameResult
  } = useGame();

  const handleMove = (from: string, to: string) => {
    const success = makeMove(from, to);
    if (success) {
      console.log(`기물 이동: ${from} → ${to}`);
    }
  };

  const getStatusText = () => {
    if (isGameOver) {
      if (gameState.gameStatus === 'checkmate') {
        const winner = gameResult === '1-0' ? '백색' : '흑색';
        return `체크메이트! ${winner} 승리`;
      } else if (gameState.gameStatus === 'stalemate') {
        return '스테일메이트! 무승부';
      }
    }
    
    if (isWhiteInCheck && gameState.currentPlayer === 'white') {
      return '백색 킹이 체크 상태입니다!';
    } else if (isBlackInCheck && gameState.currentPlayer === 'black') {
      return '흑색 킹이 체크 상태입니다!';
    }
    
    return gameState.currentPlayer === 'white' ? '백 차례' : '흑 차례';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[
            styles.turnIndicator,
            (isWhiteInCheck || isBlackInCheck) && !isGameOver && styles.checkWarning,
            isGameOver && styles.gameOver
          ]}>
            {getStatusText()}
          </Text>
        </View>
      </View>

      <CapturedPiecesRow 
        whitePieces={capturedPieces.white} 
        blackPieces={capturedPieces.black} 
      />
      
      <View style={styles.boardContainer}>
        <ChessBoard 
          position={position}
          onMove={handleMove} 
        />
      </View>
      
      <View style={styles.notationContainer}>
        <GameNotation moves={gameState.moves} />
      </View>
      
      <GameControls />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#312e2b',
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
  },
  titleContainer: {
    alignItems: 'center',
  },
  turnIndicator: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f0d9b5',
    textAlign: 'center',
  },
  checkWarning: {
    color: '#d32f2f',
    backgroundColor: '#ffebee',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
  },
  gameOver: {
    color: '#1976d2',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
  },
  boardContainer: {
    flex: 2,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    paddingTop: 10,
  },
  notationContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 5,
  },
});

export default NotationModeScreen;