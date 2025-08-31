import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Card, Button, IconButton, ProgressBar, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import ChessBoard from '@/components/ChessBoard/ChessBoard';
import GameNotation from '@/components/GameNotation/GameNotation';
import NavigationHeader from '@/components/navigation/NavigationHeader';
import { 
  ParsedPGNGame, 
  ReviewGameState,
  PGNImportOptions
} from '@/types/pgn';
import { BoardPosition, ChessMove } from '@/types/chess';
import { getGameStateAtMove } from '@/utils/pgn/pgnConverter';
import { getInitialPosition } from '@/utils/chessLogic';
import { importPGNFromClipboard } from '@/services/clipboardService';
import { SIMPLE_TEST_GAME } from '@/data/samplePGNs';
import { parsePGN } from '@/utils/pgn/pgnParser';

const { width, height } = Dimensions.get('window');

interface ReviewModeScreenProps {}

export const ReviewModeScreen: React.FC<ReviewModeScreenProps> = () => {
  const navigation = useNavigation();
  
  // 리뷰 게임 상태
  const [reviewState, setReviewState] = useState<ReviewGameState | null>(null);
  const [currentPosition, setCurrentPosition] = useState<BoardPosition>(getInitialPosition());
  const [currentMoves, setCurrentMoves] = useState<ChessMove[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // 자동 재생 관련
  const [autoPlayInterval, setAutoPlayInterval] = useState<NodeJS.Timeout | null>(null);
  
  // 게임 로드
  const loadGame = useCallback((game: ParsedPGNGame) => {
    const newReviewState: ReviewGameState = {
      pgn: game,
      currentMoveIndex: -1, // -1은 초기 위치
      totalMoves: game.moves.length,
      isPlaying: false,
      playbackSpeed: 1,
      showVariations: false,
      bookmarks: []
    };
    
    setReviewState(newReviewState);
    setCurrentPosition(getInitialPosition());
    setCurrentMoves([]);
  }, []);
  
  // 클립보드에서 PGN 가져오기
  const handleImportFromClipboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await importPGNFromClipboard();
      
      if (result.success && result.result) {
        if (result.result.games.length > 0) {
          loadGame(result.result.games[0]);
          Alert.alert('성공', 'PGN을 성공적으로 가져왔습니다.');
        } else {
          Alert.alert('오류', '유효한 게임을 찾을 수 없습니다.');
        }
      } else {
        Alert.alert('오류', result.error || 'PGN 가져오기에 실패했습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '클립보드에서 PGN을 가져올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [loadGame]);
  
  // 샘플 게임 로드
  const handleLoadSampleGame = useCallback(() => {
    try {
      const parseResult = parsePGN(SIMPLE_TEST_GAME);
      if (parseResult.success && parseResult.games.length > 0) {
        loadGame(parseResult.games[0]);
      } else {
        Alert.alert('오류', '샘플 게임을 로드할 수 없습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '샘플 게임 로드 중 오류가 발생했습니다.');
    }
  }, [loadGame]);
  
  // 특정 수로 이동
  const goToMove = useCallback((moveIndex: number) => {
    if (!reviewState) return;
    
    try {
      if (moveIndex < -1 || moveIndex >= reviewState.totalMoves) {
        return;
      }
      
      if (moveIndex === -1) {
        // 초기 위치로
        setCurrentPosition(getInitialPosition());
        setCurrentMoves([]);
      } else {
        // 특정 수까지의 게임 상태 계산
        const gameState = getGameStateAtMove(reviewState.pgn, moveIndex);
        setCurrentPosition(gameState.position);
        setCurrentMoves(gameState.moves);
      }
      
      setReviewState(prev => prev ? {
        ...prev,
        currentMoveIndex: moveIndex
      } : null);
    } catch (error) {
      console.error('Error going to move:', error);
      Alert.alert('오류', '해당 수로 이동할 수 없습니다.');
    }
  }, [reviewState]);
  
  // 이전 수로
  const goToPreviousMove = useCallback(() => {
    if (!reviewState) return;
    goToMove(reviewState.currentMoveIndex - 1);
  }, [reviewState, goToMove]);
  
  // 다음 수로
  const goToNextMove = useCallback(() => {
    if (!reviewState) return;
    goToMove(reviewState.currentMoveIndex + 1);
  }, [reviewState, goToMove]);
  
  // 처음으로
  const goToStart = useCallback(() => {
    goToMove(-1);
  }, [goToMove]);
  
  // 끝으로
  const goToEnd = useCallback(() => {
    if (!reviewState) return;
    goToMove(reviewState.totalMoves - 1);
  }, [reviewState, goToMove]);
  
  // 자동 재생 토글
  const toggleAutoPlay = useCallback(() => {
    if (!reviewState) return;
    
    if (reviewState.isPlaying) {
      // 자동 재생 중지
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        setAutoPlayInterval(null);
      }
      setReviewState(prev => prev ? { ...prev, isPlaying: false } : null);
    } else {
      // 자동 재생 시작
      const interval = setInterval(() => {
        setReviewState(current => {
          if (!current) return null;
          
          if (current.currentMoveIndex >= current.totalMoves - 1) {
            // 끝에 도달했으면 자동 재생 중지
            return { ...current, isPlaying: false };
          }
          
          goToMove(current.currentMoveIndex + 1);
          return current;
        });
      }, 2000 / (reviewState.playbackSpeed || 1)); // 속도에 따라 간격 조정
      
      setAutoPlayInterval(interval);
      setReviewState(prev => prev ? { ...prev, isPlaying: true } : null);
    }
  }, [reviewState, autoPlayInterval, goToMove]);
  
  // 재생 속도 변경
  const changePlaybackSpeed = useCallback(() => {
    if (!reviewState) return;
    
    const speeds = [0.5, 1, 2, 4];
    const currentIndex = speeds.indexOf(reviewState.playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    
    setReviewState(prev => prev ? {
      ...prev,
      playbackSpeed: nextSpeed
    } : null);
    
    // 자동 재생 중이면 간격 업데이트
    if (reviewState.isPlaying && autoPlayInterval) {
      clearInterval(autoPlayInterval);
      const newInterval = setInterval(() => {
        setReviewState(current => {
          if (!current || current.currentMoveIndex >= current.totalMoves - 1) {
            return current ? { ...current, isPlaying: false } : null;
          }
          goToMove(current.currentMoveIndex + 1);
          return current;
        });
      }, 2000 / nextSpeed);
      setAutoPlayInterval(newInterval);
    }
  }, [reviewState, autoPlayInterval, goToMove]);
  
  // 컴포넌트 정리
  useEffect(() => {
    return () => {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
      }
    };
  }, [autoPlayInterval]);
  
  // 게임 정보 카드 렌더링
  const renderGameInfo = () => {
    if (!reviewState) return null;
    
    const { headers } = reviewState.pgn;
    
    return (
      <Card style={styles.gameInfoCard}>
        <Card.Content>
          <View style={styles.gameInfoHeader}>
            <Text style={styles.gameTitle}>
              {headers.Event || '게임 리뷰'}
            </Text>
            <Text style={styles.gameResult}>
              {headers.Result || '*'}
            </Text>
          </View>
          
          <View style={styles.playersInfo}>
            <Text style={styles.playerText}>
              ⚪ {headers.White || 'White'}
            </Text>
            <Text style={styles.vsText}>vs</Text>
            <Text style={styles.playerText}>
              ⚫ {headers.Black || 'Black'}
            </Text>
          </View>
          
          {(headers.Date || headers.Site) && (
            <View style={styles.gameDetails}>
              {headers.Date && (
                <Text style={styles.detailText}>📅 {headers.Date}</Text>
              )}
              {headers.Site && (
                <Text style={styles.detailText}>📍 {headers.Site}</Text>
              )}
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };
  
  // 이동 컨트롤 렌더링
  const renderMoveControls = () => {
    if (!reviewState) return null;
    
    const progress = reviewState.totalMoves > 0 
      ? (reviewState.currentMoveIndex + 1) / reviewState.totalMoves 
      : 0;
    
    return (
      <Card style={styles.controlsCard}>
        <Card.Content>
          {/* 진행 표시 */}
          <View style={styles.progressContainer}>
            <Text style={styles.moveCounter}>
              {reviewState.currentMoveIndex + 1} / {reviewState.totalMoves}
            </Text>
            <ProgressBar 
              progress={Math.max(0, progress)}
              style={styles.progressBar}
            />
          </View>
          
          {/* 컨트롤 버튼들 */}
          <View style={styles.controlButtons}>
            <IconButton
              icon="skip-previous"
              size={24}
              onPress={goToStart}
              disabled={reviewState.currentMoveIndex <= -1}
            />
            <IconButton
              icon="chevron-left"
              size={24}
              onPress={goToPreviousMove}
              disabled={reviewState.currentMoveIndex <= -1}
            />
            <IconButton
              icon={reviewState.isPlaying ? "pause" : "play"}
              size={32}
              onPress={toggleAutoPlay}
              disabled={reviewState.currentMoveIndex >= reviewState.totalMoves - 1}
            />
            <IconButton
              icon="chevron-right"
              size={24}
              onPress={goToNextMove}
              disabled={reviewState.currentMoveIndex >= reviewState.totalMoves - 1}
            />
            <IconButton
              icon="skip-next"
              size={24}
              onPress={goToEnd}
              disabled={reviewState.currentMoveIndex >= reviewState.totalMoves - 1}
            />
          </View>
          
          {/* 재생 속도 */}
          <View style={styles.speedControl}>
            <Text style={styles.speedLabel}>속도:</Text>
            <Chip
              onPress={changePlaybackSpeed}
              style={styles.speedChip}
            >
              {reviewState.playbackSpeed}x
            </Chip>
          </View>
        </Card.Content>
      </Card>
    );
  };
  
  const handleMovePress = (index: number) => {
    goToMove(index);
  };
  
  if (!reviewState) {
    return (
      <SafeAreaView style={styles.container}>
        <NavigationHeader
          title="PGN 리뷰"
          showBack
          onBackPress={() => navigation.goBack()}
        />
        
        <ScrollView contentContainerStyle={styles.emptyStateContainer}>
          <Text style={styles.emptyStateTitle}>PGN 게임 가져오기</Text>
          <Text style={styles.emptyStateDescription}>
            PGN 형식의 체스 게임을 가져와서 수를 하나씩 검토할 수 있습니다.
          </Text>
          
          <View style={styles.importButtons}>
            <Button
              mode="contained"
              onPress={handleImportFromClipboard}
              style={styles.importButton}
              loading={isLoading}
              disabled={isLoading}
            >
              클립보드에서 가져오기
            </Button>
            
            <Button
              mode="outlined"
              onPress={handleLoadSampleGame}
              style={styles.importButton}
            >
              샘플 게임 로드
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader
        title="PGN 리뷰"
        showBack
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <IconButton
            icon="refresh"
            size={20}
            onPress={() => setReviewState(null)}
            iconColor="#f0d9b5"
          />
        }
      />
      
      <ScrollView style={styles.content}>
        {renderGameInfo()}
        
        <View style={styles.boardContainer}>
          <ChessBoard
            position={currentPosition}
          />
        </View>
        
        {renderMoveControls()}
        
        <View style={styles.notationContainer}>
          <GameNotation
            moves={currentMoves}
            currentMoveIndex={reviewState.currentMoveIndex}
            onMovePress={handleMovePress}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  content: {
    flex: 1,
    padding: 16
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center'
  },
  emptyStateDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24
  },
  importButtons: {
    width: '100%',
    gap: 16
  },
  importButton: {
    marginVertical: 8
  },
  gameInfoCard: {
    marginBottom: 16
  },
  gameInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1
  },
  gameResult: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50'
  },
  playersInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  playerText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1
  },
  vsText: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 16
  },
  gameDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8
  },
  detailText: {
    fontSize: 14,
    color: '#666'
  },
  boardContainer: {
    alignItems: 'center',
    marginBottom: 16
  },
  controlsCard: {
    marginBottom: 16
  },
  progressContainer: {
    marginBottom: 16
  },
  moveCounter: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8
  },
  progressBar: {
    height: 6,
    borderRadius: 3
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  speedControl: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8
  },
  speedLabel: {
    fontSize: 16,
    fontWeight: '500'
  },
  speedChip: {
    minWidth: 60
  },
  notationContainer: {
    marginBottom: 16
  }
});

export default ReviewModeScreen;