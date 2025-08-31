import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  BackHandler,
  Alert,
  Dimensions,
  TouchableOpacity,
  Text,
} from 'react-native';
import {
  Surface,
  Card,
  Title,
  Paragraph,
  Button,
  FAB,
  Portal,
  Dialog,
  RadioButton,
  ActivityIndicator,
  ProgressBar,
  Chip,
  IconButton,
} from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import ChessBoard from '@/components/ChessBoard/ChessBoard';
import GameNotation from '@/components/GameNotation/GameNotation';
import { useGame } from '@/context/GameContext';
import { useAI } from '@/context/AIContext';
import { 
  findBestMove, 
  AI_PRESETS, 
  AIConfig, 
  AIMove 
} from '@/utils/chessAI';
import { convertMovesToPGN } from '@/utils/pgn/pgnConverter';
import { shareGame } from '@/utils/navigation';
import type { AIModeScreenProps } from '@/types/navigation';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isTablet = screenWidth > 768;

export default function AIModeScreen({ navigation }: AIModeScreenProps) {
  const nav = useNavigation();
  const {
    gameState,
    position,
    selectedSquare,
    possibleMoves,
    lastMove,
    isGameOver,
    gameResult,
    makeMove,
    setSelectedSquare,
    newGame,
    undoMove,
  } = useGame();

  const {
    gameSettings,
    updateGameSettings,
    addGameRecord,
    getOptimizedAIConfig,
  } = useAI();

  // AI 게임 상태
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [aiMove, setAiMove] = useState<AIMove | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<Date | null>(null);
  const [aiEvaluation, setAiEvaluation] = useState<string>('');
  const [thinkingProgress, setThinkingProgress] = useState(0);

  // AI 색상 결정
  const finalAiColor = useMemo(() => {
    if (gameSettings.aiColor === 'random') {
      return Math.random() > 0.5 ? 'white' : 'black';
    }
    return gameSettings.aiColor;
  }, [gameSettings.aiColor, gameStarted]);

  const humanColor = finalAiColor === 'white' ? 'black' : 'white';

  // 뒤로가기 처리
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (gameStarted && !isGameOver) {
          Alert.alert(
            '게임 종료',
            '진행 중인 게임을 종료하시겠습니까?',
            [
              { text: '취소', style: 'cancel' },
              { text: '종료', style: 'destructive', onPress: () => nav.goBack() },
            ]
          );
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [nav, gameStarted, isGameOver])
  );

  // AI 이동 실행
  const executeAIMove = useCallback(async () => {
    if (isAIThinking || gameState.currentPlayer !== finalAiColor || isGameOver) {
      return;
    }

    setIsAIThinking(true);
    setThinkingProgress(0);

    // 진행률 업데이트 애니메이션
    const progressInterval = setInterval(() => {
      setThinkingProgress(prev => {
        if (prev >= 0.9) {
          clearInterval(progressInterval);
          return 0.9;
        }
        return prev + 0.1;
      });
    }, 200);

    try {
      const aiConfig = AI_PRESETS[gameSettings.difficulty];
      const bestMove = await findBestMove(
        position,
        finalAiColor,
        aiConfig,
        gameState.castlingRights,
        gameState.enPassantSquare
      );

      clearInterval(progressInterval);
      setThinkingProgress(1);

      if (bestMove) {
        setAiMove(bestMove);
        setAiEvaluation(bestMove.evaluation);
        
        // 잠시 대기 후 이동 실행
        setTimeout(() => {
          const validPromotion = bestMove.promotion && ['queen', 'rook', 'bishop', 'knight'].includes(bestMove.promotion) ? bestMove.promotion as 'queen' | 'rook' | 'bishop' | 'knight' : undefined;
          const success = makeMove(bestMove.from, bestMove.to, validPromotion);
          if (success) {
            console.log(`AI moved: ${bestMove.from} → ${bestMove.to} (score: ${bestMove.score.toFixed(2)})`);
          }
          setIsAIThinking(false);
          setThinkingProgress(0);
        }, 500);
      } else {
        console.log('AI could not find a move');
        setIsAIThinking(false);
        setThinkingProgress(0);
      }
    } catch (error) {
      console.error('AI move error:', error);
      clearInterval(progressInterval);
      setIsAIThinking(false);
      setThinkingProgress(0);
    }
  }, [
    isAIThinking,
    gameState.currentPlayer,
    finalAiColor,
    isGameOver,
    position,
    gameSettings.difficulty,
    gameState.castlingRights,
    gameState.enPassantSquare,
    makeMove,
  ]);

  // 게임 상태 변화 감지하여 AI 이동 트리거
  useEffect(() => {
    if (gameStarted && gameState.currentPlayer === finalAiColor && !isGameOver && !isAIThinking) {
      // 약간의 딜레이 후 AI 이동
      const timer = setTimeout(() => {
        executeAIMove();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [gameStarted, gameState.currentPlayer, finalAiColor, isGameOver, executeAIMove]);

  // 새 게임 시작
  const startNewGame = useCallback(() => {
    newGame();
    setGameStarted(true);
    setGameStartTime(new Date());
    setAiMove(null);
    setAiEvaluation('게임 시작!');
  }, [newGame]);

  // 게임 종료 시 기록 저장
  useEffect(() => {
    if (isGameOver && gameStarted && gameStartTime) {
      const saveGameRecord = async () => {
        try {
          const duration = Math.round((Date.now() - gameStartTime.getTime()) / 1000);
          const pgn = convertMovesToPGN(gameState.moves);
          
          await addGameRecord({
            date: new Date().toISOString(),
            playerColor: humanColor,
            aiDifficulty: gameSettings.difficulty,
            result: gameResult as '1-0' | '0-1' | '1/2-1/2' | '*',
            moves: gameState.moves.map(move => move.san),
            duration,
            pgn,
          });
        } catch (error) {
          console.error('Failed to save game record:', error);
        }
      };
      
      saveGameRecord();
    }
  }, [isGameOver, gameStarted, gameStartTime, gameState.moves, gameState.headers, finalAiColor, humanColor, gameSettings.difficulty, gameResult, addGameRecord]);

  // 게임 공유
  const handleShareGame = useCallback(async () => {
    try {
      const pgn = convertMovesToPGN(gameState.moves);
      await shareGame(pgn, 'ChessNote_AI_Game.pgn');
    } catch (error) {
      Alert.alert('오류', '게임 공유에 실패했습니다.');
    }
  }, [gameState.moves, gameState.headers, finalAiColor, gameSettings.difficulty]);

  // 체스보드 크기 계산
  const boardSize = isTablet 
    ? Math.min(screenWidth * 0.5, screenHeight * 0.6)
    : Math.min(screenWidth * 0.92, screenHeight * 0.45);

  // 난이도별 설명
  const difficultyDescriptions = {
    beginner: '초보자 레벨 - 실수를 자주 합니다',
    intermediate: '중급자 레벨 - 기본적인 전략을 사용합니다',
    advanced: '고급자 레벨 - 깊이 있는 계산을 합니다',
    master: '마스터 레벨 - 최고 수준의 플레이를 합니다',
  };

  return (
    <Surface style={styles.container}>
      <StatusBar style="light" />
      
      {/* 게임 시작 전 설정 화면 */}
      {!gameStarted && (
        <View style={styles.setupContainer}>
          <Card style={styles.setupCard}>
            <Card.Content>
              <Title style={styles.setupTitle}>AI 대전 설정</Title>
              
              {/* 난이도 선택 */}
              <View style={styles.settingSection}>
                <Paragraph style={styles.settingLabel}>난이도</Paragraph>
                <View style={styles.radioGroup}>
                  {Object.keys(AI_PRESETS).map((difficulty) => (
                    <TouchableOpacity
                      key={difficulty}
                      style={styles.radioItem}
                      onPress={() => updateGameSettings({ difficulty: difficulty as keyof typeof AI_PRESETS })}
                    >
                      <RadioButton
                        value={difficulty}
                        status={gameSettings.difficulty === difficulty ? 'checked' : 'unchecked'}
                        color="#f0d9b5"
                      />
                      <View style={styles.radioContent}>
                        <Text style={styles.radioLabel}>
                          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                        </Text>
                        <Text style={styles.radioDescription}>
                          {difficultyDescriptions[difficulty as keyof typeof difficultyDescriptions]}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* 색상 선택 */}
              <View style={styles.settingSection}>
                <Paragraph style={styles.settingLabel}>당신의 색상</Paragraph>
                <View style={styles.colorButtons}>
                  <Button
                    mode={gameSettings.aiColor === 'black' ? 'contained' : 'outlined'}
                    onPress={() => updateGameSettings({ aiColor: 'black' })}
                    style={styles.colorButton}
                    buttonColor={gameSettings.aiColor === 'black' ? '#f0d9b5' : undefined}
                    textColor={gameSettings.aiColor === 'black' ? '#312e2b' : '#f0d9b5'}
                  >
                    백 (선공)
                  </Button>
                  <Button
                    mode={gameSettings.aiColor === 'white' ? 'contained' : 'outlined'}
                    onPress={() => updateGameSettings({ aiColor: 'white' })}
                    style={styles.colorButton}
                    buttonColor={gameSettings.aiColor === 'white' ? '#f0d9b5' : undefined}
                    textColor={gameSettings.aiColor === 'white' ? '#312e2b' : '#f0d9b5'}
                  >
                    흑 (후공)
                  </Button>
                  <Button
                    mode={gameSettings.aiColor === 'random' ? 'contained' : 'outlined'}
                    onPress={() => updateGameSettings({ aiColor: 'random' })}
                    style={styles.colorButton}
                    buttonColor={gameSettings.aiColor === 'random' ? '#f0d9b5' : undefined}
                    textColor={gameSettings.aiColor === 'random' ? '#312e2b' : '#f0d9b5'}
                  >
                    랜덤
                  </Button>
                </View>
              </View>

              <Button
                mode="contained"
                onPress={startNewGame}
                style={styles.startButton}
                buttonColor="#f0d9b5"
                textColor="#312e2b"
              >
                게임 시작
              </Button>
            </Card.Content>
          </Card>
        </View>
      )}

      {/* 게임 진행 화면 */}
      {gameStarted && (
        <>
          {/* 상단 정보 바 */}
          <View style={styles.topBar}>
            <View style={styles.gameInfo}>
              <Chip 
                icon="robot" 
                textStyle={styles.chipText}
                style={[styles.chip, { backgroundColor: finalAiColor === 'white' ? '#f0d9b5' : '#8b4513' }]}
              >
                AI ({gameSettings.difficulty})
              </Chip>
              <Chip 
                icon="account" 
                textStyle={styles.chipText}
                style={[styles.chip, { backgroundColor: humanColor === 'white' ? '#f0d9b5' : '#8b4513' }]}
              >
                플레이어
              </Chip>
            </View>
            
            <View style={styles.gameStatus}>
              <Text style={styles.turnText}>
                {gameState.currentPlayer === 'white' ? '백' : '흑'}의 차례
              </Text>
              {isGameOver && (
                <Text style={styles.resultText}>
                  {gameResult === '1-0' ? '백 승리' : 
                   gameResult === '0-1' ? '흑 승리' : '무승부'}
                </Text>
              )}
            </View>
          </View>

          {/* AI 사고 중 표시 */}
          {isAIThinking && (
            <View style={styles.thinkingContainer}>
              <View style={styles.thinkingInfo}>
                <ActivityIndicator size="small" color="#f0d9b5" />
                <Text style={styles.thinkingText}>AI가 생각 중...</Text>
              </View>
              <ProgressBar 
                progress={thinkingProgress} 
                color="#f0d9b5" 
                style={styles.progressBar}
              />
            </View>
          )}

          {/* AI 평가 */}
          {aiEvaluation && !isAIThinking && (
            <View style={styles.evaluationContainer}>
              <Text style={styles.evaluationText}>{aiEvaluation}</Text>
            </View>
          )}

          {/* 체스보드 */}
          <View style={styles.boardContainer}>
            <ChessBoard
              position={position}
              possibleMoves={possibleMoves}
              lastMove={lastMove}
              selectedSquare={selectedSquare}
              onSquareSelect={(square: string | null) => {
                if (isAIThinking || gameState.currentPlayer === finalAiColor) return;
                
                if (!square) {
                  setSelectedSquare(null);
                  return;
                }
                
                const piece = position[square];
                
                if (selectedSquare === square) {
                  setSelectedSquare(null);
                } else if (!selectedSquare && piece?.color === humanColor) {
                  setSelectedSquare(square);
                } else if (selectedSquare && selectedSquare !== square) {
                  const success = makeMove(selectedSquare, square);
                  if (success) {
                    setSelectedSquare(null);
                  } else if (piece?.color === humanColor) {
                    setSelectedSquare(square);
                  }
                }
              }}
              disabled={isAIThinking || gameState.currentPlayer === finalAiColor}
            />
          </View>

          {/* 기보 */}
          <View style={styles.notationContainer}>
            <GameNotation 
              moves={gameState.moves} 
            />
          </View>

          {/* 게임 컨트롤 */}
          <View style={styles.controls}>
            <IconButton
              icon="undo"
              size={24}
              iconColor="#f0d9b5"
              onPress={() => {
                if (gameState.moves.length >= 2) {
                  // AI와 플레이어 이동 둘 다 되돌리기
                  undoMove();
                  setTimeout(() => undoMove(), 100);
                } else if (gameState.moves.length === 1) {
                  undoMove();
                }
              }}
              disabled={isAIThinking || gameState.moves.length === 0}
            />
            <IconButton
              icon="restart"
              size={24}
              iconColor="#f0d9b5"
              onPress={() => {
                Alert.alert(
                  '새 게임',
                  '새 게임을 시작하시겠습니까?',
                  [
                    { text: '취소', style: 'cancel' },
                    { 
                      text: '시작', 
                      onPress: () => {
                        setGameStarted(false);
                        setGameStartTime(null);
                        setAiMove(null);
                        setAiEvaluation('');
                      }
                    },
                  ]
                );
              }}
            />
            <IconButton
              icon="share-variant"
              size={24}
              iconColor="#f0d9b5"
              onPress={handleShareGame}
              disabled={gameState.moves.length === 0}
            />
          </View>
        </>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#312e2b',
  },
  setupContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  setupCard: {
    backgroundColor: '#8b4513',
  },
  setupTitle: {
    textAlign: 'center',
    color: '#f0d9b5',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  settingSection: {
    marginBottom: 24,
  },
  settingLabel: {
    color: '#f0d9b5',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  radioGroup: {
    gap: 8,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  radioContent: {
    flex: 1,
    marginLeft: 8,
  },
  radioLabel: {
    color: '#f0d9b5',
    fontSize: 16,
    fontWeight: '600',
  },
  radioDescription: {
    color: '#d4c4a8',
    fontSize: 14,
    marginTop: 2,
  },
  colorButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  colorButton: {
    flex: 1,
  },
  startButton: {
    marginTop: 20,
    paddingVertical: 8,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#8b4513',
  },
  gameInfo: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    height: 32,
  },
  chipText: {
    color: '#312e2b',
    fontSize: 12,
    fontWeight: 'bold',
  },
  gameStatus: {
    alignItems: 'flex-end',
  },
  turnText: {
    color: '#f0d9b5',
    fontSize: 14,
    fontWeight: 'bold',
  },
  resultText: {
    color: '#f0d9b5',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  thinkingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#8b4513',
  },
  thinkingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  thinkingText: {
    color: '#f0d9b5',
    fontSize: 14,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#312e2b',
  },
  evaluationContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#654321',
  },
  evaluationText: {
    color: '#f0d9b5',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  boardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  notationContainer: {
    height: 120,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  notation: {
    backgroundColor: '#8b4513',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 20,
  },
});