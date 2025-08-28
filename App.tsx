import { StatusBar } from 'expo-status-bar';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { GameProvider, useGame } from './src/context/GameContext';
import ChessBoard from './src/components/ChessBoard';
import GameNotation from './src/components/GameNotation';
import GameControls from './src/components/Controls';
import CapturedPiecesRow from './src/components/CapturedPieces';

// 메인 게임 컴포넌트 (GameProvider 내부)
const GameScreen: React.FC = () => {
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

  // 게임 상태 텍스트 생성
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
      
      {/* 앱 제목 */}
      <View style={styles.header}>
        <Text style={styles.title}>ChessNote</Text>
        <Text style={styles.version}>v1.1.0</Text>
        
        {/* 턴 표시 */}
        <Text style={[
          styles.turnIndicator,
          (isWhiteInCheck || isBlackInCheck) && !isGameOver && styles.checkWarning,
          isGameOver && styles.gameOver
        ]}>
          {getStatusText()}
        </Text>
        
        {/* 캡처된 기물 표시 (헤더 내부로 이동) */}
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
        <GameNotation moves={gameState.moves} />
      </View>
      
      {/* 제어 버튼들 */}
      <GameControls />
    </SafeAreaView>
  );
};

// 메인 앱 컴포넌트
export default function App() {
  useEffect(() => {
    // 앱이 시작될 때 화면 꺼짐 방지 활성화
    const enableKeepAwake = async () => {
      await activateKeepAwakeAsync();
    };

    enableKeepAwake();

    // 앱이 종료될 때 정리 (선택사항)
    return () => {
      deactivateKeepAwake();
    };
  }, []);

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
    paddingBottom: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 3,
  },
  version: {
    fontSize: 12,
    color: '#666666',
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