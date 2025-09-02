import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { IconButton } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useGame } from '@/context/GameContext';
import { useNavigation } from '@/context/NavigationContext';
import ChessBoard from '@/components/ChessBoard';
import { GameNotation } from '@/components/GameNotation';
import { GameControls } from '@/components/Controls';
import CapturedPiecesRow from '@/components/CapturedPieces';

const WriteModeScreen: React.FC = () => {
  const { 
    gameState, 
    position, 
    makeMove, 
    capturedPieces,
    isWhiteInCheck,
    isBlackInCheck,
    isGameOver,
    gameResult,
    newGame,
    gameMode,
    setGameMode,
  } = useGame();
  
  const { navigateToHome } = useNavigation();

  // WriteModeScreen 진입 시 자동으로 새 게임 시작
  useEffect(() => {
    if (gameMode !== 'write') {
      setGameMode('write');
    }
    newGame();
  }, []);

  const handleMove = (from: string, to: string) => {
    const success = makeMove(from, to);
    if (success) {
      console.log(`기물 이동: ${from} → ${to}`);
    }
  };

  // 게임 상태 텍스트 생성 (live 모드 전용)
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
      <StatusBar style="light" />
      
      {/* 헤더 - 뒤로가기 버튼 포함 */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor="#ffffff"
            onPress={navigateToHome}
            style={styles.backButton}
          />
          <View style={styles.titleContainer}>
            <Text style={styles.title}>새 게임 작성</Text>
            <Text style={styles.subtitle}>실시간 기보 작성</Text>
          </View>
          <View style={styles.placeholder} />
        </View>
        
        {/* 턴 표시 */}
        <Text style={[
          styles.turnIndicator,
          (isWhiteInCheck || isBlackInCheck) && !isGameOver && styles.checkWarning,
          isGameOver && styles.gameOver
        ]}>
          {getStatusText()}
        </Text>
        
        {/* 캡처된 기물 표시 */}
        <CapturedPiecesRow 
          whitePieces={capturedPieces.white} 
          blackPieces={capturedPieces.black} 
        />
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
        <GameNotation moves={gameState.moves} title="기보" />
      </View>
      
      {/* 제어 버튼들 */}
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
    paddingTop: 10,
    paddingBottom: 5,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  backButton: {
    margin: 0,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  placeholder: {
    width: 40, // backButton과 동일한 크기로 중앙 정렬
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  },
  turnIndicator: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#f0d9b5',
    textAlign: 'center',
  },
  checkWarning: {
    color: '#d32f2f',
    backgroundColor: '#ffebee',
    padding: 6,
    borderRadius: 4,
    marginHorizontal: 20,
  },
  gameOver: {
    color: '#1976d2',
    backgroundColor: '#e3f2fd',
    padding: 6,
    borderRadius: 4,
    marginHorizontal: 20,
  },
  boardContainer: {
    flex: 2,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    paddingTop: 0,
  },
  notationContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: 40,
    marginBottom: 5,
  },
});

export default WriteModeScreen;