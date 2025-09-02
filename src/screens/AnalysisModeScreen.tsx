import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { IconButton } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useGame } from '@/context/GameContext';
import { useNavigation } from '@/context/NavigationContext';
import ChessBoard from '@/components/ChessBoard';
import { GameNotation, ImportModal } from '@/components/GameNotation';
import { MoveControls } from '@/components/Controls';
import { getMovesFromTree } from '@/utils/pgnParser';

const AnalysisModeScreen: React.FC = () => {
  const { 
    gameState, 
    position, 
    gameMode,
    loadedGame,
    currentMoveIndex,
    setGameMode
  } = useGame();
  
  const { navigateToHome } = useNavigation();
  const [showImportModal, setShowImportModal] = React.useState(false);

  // 분석 모드로 전환
  useEffect(() => {
    if (gameMode !== 'analysis') {
      setGameMode('analysis');
    }
  }, [gameMode, setGameMode]);

  // 로드된 게임이 없으면 ImportModal 자동 표시
  useEffect(() => {
    if (!loadedGame) {
      setShowImportModal(true);
    }
  }, [loadedGame]);

  const handleMove = (from: string, to: string) => {
    // 분석 모드에서는 이동 비활성화
    console.log('분석 모드에서는 기물 이동이 비활성화됩니다.');
  };

  // 게임 상태 텍스트 생성 (분석 모드 전용)
  const getStatusText = () => {
    if (loadedGame) {
      const currentMove = currentMoveIndex + 1;
      const totalMoves = loadedGame.totalMoves;
      return `분석 모드 - ${currentMove}/${totalMoves}수`;
    }
    return '기보를 가져와서 분석을 시작하세요';
  };

  // 게임 정보 표시
  const getGameInfo = () => {
    if (loadedGame) {
      const { headers } = loadedGame;
      return `${headers.White || '백'} vs ${headers.Black || '흑'} (${headers.Date || ''})`;
    }
    return '';
  };

  // 현재 표시할 이동 목록 (분석 모드 전용)
  const currentMoves = React.useMemo(() => {
    if (loadedGame) {
      const allMoves = getMovesFromTree(loadedGame.tree);
      return allMoves.slice(0, currentMoveIndex + 1);
    }
    return [];
  }, [loadedGame, currentMoveIndex]);

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
            <Text style={styles.title}>기보 분석</Text>
            <Text style={styles.subtitle}>PGN 분석 모드</Text>
          </View>
          <IconButton
            icon="file-import-outline"
            size={24}
            iconColor="#ffffff"
            onPress={() => setShowImportModal(true)}
            style={styles.importButton}
          />
        </View>
        
        {/* 게임 상태 표시 */}
        <Text style={styles.statusIndicator}>
          {getStatusText()}
        </Text>
        
        {/* 게임 정보 */}
        {loadedGame && (
          <Text style={styles.gameInfo}>
            {getGameInfo()}
          </Text>
        )}
      </View>
      
      {/* 로드된 게임이 있을 때만 체스보드와 기보 표시 */}
      {loadedGame ? (
        <>
          {/* 체스보드 */}
          <View style={styles.boardContainer}>
            <ChessBoard 
              position={position}
              onMove={handleMove} 
            />
          </View>
          
          {/* 기보 표시 */}
          <View style={styles.notationContainer}>
            <GameNotation moves={currentMoves} title="분석 기보" />
          </View>
          
          {/* 분석 모드 네비게이션 */}
          <MoveControls />
        </>
      ) : (
        <View style={styles.noGameContainer}>
          <Text style={styles.noGameText}>
            PGN 파일을 가져와서 분석을 시작하세요
          </Text>
          <Text style={styles.noGameSubtext}>
            우상단의 가져오기 버튼을 눌러주세요
          </Text>
        </View>
      )}
      
      {/* Import Modal */}
      <ImportModal 
        visible={showImportModal}
        onDismiss={() => setShowImportModal(false)}
      />
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
  importButton: {
    margin: 0,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
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
  statusIndicator: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#9C27B0',
    textAlign: 'center',
  },
  gameInfo: {
    fontSize: 12,
    color: '#b0b0b0',
    textAlign: 'center',
    marginBottom: 5,
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
  noGameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noGameText: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
  },
  noGameSubtext: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
  },
});

export default AnalysisModeScreen;