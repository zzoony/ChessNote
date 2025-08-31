import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Modal
} from 'react-native';
import { usePuzzle } from '@/context/PuzzleContext';
import PuzzleBoard from '@/components/PuzzleBoard';
import { 
  puzzleCategories, 
  getPuzzlesByCategory, 
  getRandomPuzzle, 
  getDailyPuzzle
} from '@/data/puzzles';
import { ChessPuzzle } from '@/types';
import type { PuzzleModeScreenProps } from '@/types/navigation';
import { PuzzleStatsCard } from '@/components/PuzzleStats';

const { width, height } = Dimensions.get('window');
const boardSize = Math.min(width * 0.9, height * 0.4);

const PuzzleModeScreen: React.FC<PuzzleModeScreenProps> = ({ navigation }) => {
  const {
    puzzleGameState,
    position,
    possibleMoves,
    puzzleProgress,
    puzzleStats,
    loadPuzzle,
    makeMove,
    resetPuzzle,
    showHint,
    hideHint,
    markPuzzleCompleted
  } = usePuzzle();

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [currentPuzzle, setCurrentPuzzle] = useState<ChessPuzzle | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // 퍼즐 선택 시
  const selectPuzzle = (puzzle: ChessPuzzle) => {
    setCurrentPuzzle(puzzle);
    loadPuzzle(puzzle);
    setStartTime(new Date());
  };

  // 카테고리별 퍼즐 선택
  const selectCategory = (categoryId: string) => {
    const puzzles = getPuzzlesByCategory(categoryId);
    if (puzzles.length > 0) {
      const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
      selectPuzzle(randomPuzzle);
    }
    setShowCategoryModal(false);
  };

  // 일일 퍼즐 시작
  const startDailyPuzzle = () => {
    const daily = getDailyPuzzle();
    selectPuzzle(daily);
  };

  // 랜덤 퍼즐 시작
  const startRandomPuzzle = () => {
    const random = getRandomPuzzle();
    selectPuzzle(random);
  };

  // 퍼즐 완료 처리
  const handlePuzzleComplete = async (success: boolean) => {
    if (!currentPuzzle || !startTime) return;

    const timeSpent = Date.now() - startTime.getTime();
    const hintsUsed = puzzleGameState?.session.hintsUsed || 0;

    await markPuzzleCompleted(currentPuzzle.id, success, timeSpent, hintsUsed);

    if (success) {
      Alert.alert(
        '축하합니다! 🎉',
        `퍼즐을 해결했습니다!\n시간: ${(timeSpent / 1000).toFixed(1)}초\n힌트 사용: ${hintsUsed}회`,
        [
          { text: '다시 풀기', onPress: resetPuzzle },
          { text: '다음 퍼즐', onPress: startRandomPuzzle },
          { text: '메뉴로', onPress: () => setCurrentPuzzle(null) }
        ]
      );
    } else {
      Alert.alert(
        '아쉽네요 😅',
        '다시 도전해보세요!',
        [
          { text: '다시 풀기', onPress: resetPuzzle },
          { text: '힌트 보기', onPress: showHint },
          { text: '포기하기', onPress: () => setCurrentPuzzle(null) }
        ]
      );
    }
  };

  // 퍼즐 완료 체크
  useEffect(() => {
    if (puzzleGameState?.session.isCompleted) {
      handlePuzzleComplete(puzzleGameState.session.isCorrect);
    }
  }, [puzzleGameState?.session.isCompleted]);

  // 메인 메뉴 화면
  if (!currentPuzzle) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← 뒤로</Text>
          </TouchableOpacity>
          <Text style={styles.title}>퍼즐 모드</Text>
        </View>

        <ScrollView style={styles.scrollView}>
          {/* 통계 카드들 */}
          <PuzzleStatsCard
            title="전체 성과"
            stats={[
              { label: '해결한 퍼즐', value: puzzleStats.solvedPuzzles, color: '#4CAF50' },
              { label: '정확도', value: `${puzzleStats.accuracy.toFixed(1)}%`, color: '#2196F3' },
              { label: '연속 해결', value: puzzleStats.currentStreak, color: '#FF9800' }
            ]}
          />
          
          <PuzzleStatsCard
            title="성과 분석"
            stats={[
              { label: '전체 시도', value: puzzleStats.totalPuzzles, color: '#9C27B0' },
              { label: '최고 연승', value: puzzleStats.bestStreak, color: '#F44336' },
              { 
                label: '평균 시간', 
                value: puzzleStats.averageTime > 0 ? `${(puzzleStats.averageTime / 1000).toFixed(1)}초` : '0초', 
                color: '#607D8B' 
              }
            ]}
          />

          {/* 빠른 시작 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>빠른 시작</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.dailyButton]}
                onPress={startDailyPuzzle}
              >
                <Text style={styles.actionIcon}>📅</Text>
                <Text style={styles.actionTitle}>일일 퍼즐</Text>
                <Text style={styles.actionSubtitle}>오늘의 추천 퍼즐</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, styles.randomButton]}
                onPress={startRandomPuzzle}
              >
                <Text style={styles.actionIcon}>🎲</Text>
                <Text style={styles.actionTitle}>랜덤 퍼즐</Text>
                <Text style={styles.actionSubtitle}>무작위 선택</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 카테고리 선택 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>카테고리별 연습</Text>
            <View style={styles.categoriesGrid}>
              {puzzleCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.categoryCard, { borderLeftColor: category.color }]}
                  onPress={() => selectCategory(category.id)}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <View style={styles.categoryContent}>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryDescription}>{category.description}</Text>
                    <Text style={styles.categoryCount}>{category.puzzleCount}개 퍼즐</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 퍼즐 플레이 화면
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setCurrentPuzzle(null)}
        >
          <Text style={styles.backButtonText}>← 메뉴</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{currentPuzzle.title || '퍼즐'}</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* 퍼즐 정보 */}
        <View style={styles.puzzleInfo}>
          <View style={styles.puzzleHeader}>
            <View style={styles.puzzleTags}>
              <Text style={[styles.tag, styles.themeTag]}>
                {currentPuzzle.theme}
              </Text>
              <Text style={[styles.tag, styles.ratingTag]}>
                {currentPuzzle.rating}
              </Text>
            </View>
          </View>
          <Text style={styles.puzzleDescription}>{currentPuzzle.description}</Text>
          
          {/* 에러 메시지 */}
          {puzzleGameState?.hasError && (
            <View style={styles.errorMessage}>
              <Text style={styles.errorText}>
                {puzzleGameState.errorMessage}
              </Text>
            </View>
          )}

          {/* 힌트 표시 */}
          {puzzleGameState?.showHint && puzzleGameState.currentHint && (
            <View style={styles.hintMessage}>
              <Text style={styles.hintText}>
                💡 힌트: {puzzleGameState.currentHint.data.explanation || puzzleGameState.currentHint.data.move}
              </Text>
              <TouchableOpacity onPress={hideHint} style={styles.hideHintButton}>
                <Text style={styles.hideHintText}>숨기기</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 체스보드 */}
        <View style={styles.boardContainer}>
          <PuzzleBoard
            size={boardSize}
            position={position}
            onMove={makeMove}
            possibleMoves={possibleMoves}
            lastMove={null}
            disabled={!puzzleGameState?.isWaitingForUserMove}
          />
        </View>

        {/* 컨트롤 버튼들 */}
        <View style={styles.controls}>
          <TouchableOpacity 
            style={[styles.controlButton, styles.resetButton]}
            onPress={resetPuzzle}
          >
            <Text style={styles.controlButtonText}>🔄 다시 시작</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.controlButton, styles.hintButton]}
            onPress={showHint}
            disabled={puzzleGameState?.showHint}
          >
            <Text style={styles.controlButtonText}>💡 힌트</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.controlButton, styles.giveUpButton]}
            onPress={() => {
              Alert.alert(
                '포기하시겠습니까?',
                '메뉴로 돌아갑니다.',
                [
                  { text: '취소', style: 'cancel' },
                  { text: '포기', onPress: () => setCurrentPuzzle(null) }
                ]
              );
            }}
          >
            <Text style={styles.controlButtonText}>🏳️ 포기</Text>
          </TouchableOpacity>
        </View>

        {/* 진행 상황 */}
        {puzzleGameState && (
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              진행: {puzzleGameState.solutionIndex} / {currentPuzzle.solution.length}
            </Text>
            <Text style={styles.progressText}>
              실수: {puzzleGameState.session.mistakes}회
            </Text>
            <Text style={styles.progressText}>
              힌트: {puzzleGameState.session.hintsUsed}회 사용
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    color: '#4CAF50',
    fontSize: 16,
  },
  title: {
    flex: 1,
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  

  // 섹션
  section: {
    padding: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  // 빠른 액션
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  dailyButton: {
    backgroundColor: '#FF9800',
  },
  randomButton: {
    backgroundColor: '#2196F3',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  actionSubtitle: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
  },

  // 카테고리 그리드
  categoriesGrid: {
    gap: 12,
  },
  categoryCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
  },
  categoryIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  categoryContent: {
    flex: 1,
  },
  categoryName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  categoryDescription: {
    color: '#999',
    fontSize: 14,
    marginBottom: 4,
  },
  categoryCount: {
    color: '#4CAF50',
    fontSize: 12,
  },

  // 퍼즐 플레이 화면
  puzzleInfo: {
    padding: 16,
  },
  puzzleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  puzzleTags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    color: '#fff',
  },
  themeTag: {
    backgroundColor: '#FF9800',
  },
  ratingTag: {
    backgroundColor: '#9C27B0',
  },
  puzzleDescription: {
    color: '#ccc',
    fontSize: 16,
    lineHeight: 24,
  },

  // 메시지들
  errorMessage: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f44336',
    borderRadius: 8,
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
  },
  hintMessage: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FF9800',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hintText: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  hideHintButton: {
    marginLeft: 12,
  },
  hideHintText: {
    color: '#fff',
    fontSize: 12,
    textDecorationLine: 'underline',
  },

  // 체스보드
  boardContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },

  // 컨트롤 버튼들
  controls: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  controlButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#2196F3',
  },
  hintButton: {
    backgroundColor: '#FF9800',
  },
  giveUpButton: {
    backgroundColor: '#f44336',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // 진행 정보
  progressInfo: {
    padding: 16,
    backgroundColor: '#2a2a2a',
    margin: 16,
    borderRadius: 8,
  },
  progressText: {
    color: '#999',
    fontSize: 14,
    marginBottom: 4,
  },
});

export default PuzzleModeScreen;