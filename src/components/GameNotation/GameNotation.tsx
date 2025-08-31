import React, { useRef, useEffect, useMemo } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChessMove } from '@/types';
import { useTheme } from '@/context/ThemeContext';

interface GameNotationProps {
  moves: ChessMove[];
  title?: string;
  currentMoveIndex?: number;
  onMovePress?: (index: number) => void;
}

const GameNotation: React.FC<GameNotationProps> = React.memo(({ 
  moves, 
  title = '기보',
  currentMoveIndex = -1,
  onMovePress
}) => {
  const { currentTheme } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);

  // 새로운 이동이 있을 때마다 자동 스크롤
  useEffect(() => {
    if (moves.length > 0 && scrollViewRef.current) {
      // 약간의 지연을 두어 렌더링 완료 후 스크롤
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [moves.length]);
  
  // PGN 형식으로 이동들을 정리 (memoized)
  const formattedMoves = useMemo(() => {
    const formatted = [];
    
    for (let i = 0; i < moves.length; i += 2) {
      const moveNumber = Math.floor(i / 2) + 1;
      const whiteMove = moves[i]?.san || '';
      const blackMove = moves[i + 1]?.san || '';
      
      formatted.push({
        number: moveNumber,
        white: whiteMove,
        black: blackMove,
        whiteIndex: i,
        blackIndex: i + 1
      });
    }
    
    return formatted;
  }, [moves]);

  const handleMovePress = (index: number) => {
    if (onMovePress && index < moves.length) {
      onMovePress(index);
    }
  };

  const getMoveStyle = (moveIndex: number) => {
    const isSelected = moveIndex === currentMoveIndex;
    return [
      styles.move,
      moveIndex % 2 === 0 ? styles.whiteMove : styles.blackMove,
      isSelected && styles.selectedMove,
      onMovePress && styles.clickableMove
    ];
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.colors.card }]}>
      {/* 제목 */}
      <View style={[styles.header, { borderBottomColor: currentTheme.colors.border }]}>
        <Text style={[styles.title, { color: currentTheme.colors.text }]}>{title}</Text>
        <Text style={[styles.moveCount, { color: currentTheme.colors.textSecondary }]}>
          {currentMoveIndex >= 0 ? `${currentMoveIndex + 1}/` : ''}{moves.length}수
        </Text>
      </View>
      
      {/* 기보 내용 */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {formattedMoves.length === 0 ? (
          <Text style={[styles.emptyText, { color: currentTheme.colors.textSecondary }]}>
            {onMovePress ? 'PGN을 가져와서 기보를 확인하세요' : '체스 기물을 움직여서 기보를 시작하세요'}
          </Text>
        ) : (
          formattedMoves.map((move, index) => (
            <View key={index} style={[styles.moveRow, { borderBottomColor: currentTheme.colors.border }]}>
              <Text style={[styles.moveNumber, { color: currentTheme.colors.textSecondary }]}>{move.number}.</Text>
              <View style={styles.movesContainer}>
                {move.white && (
                  <TouchableOpacity
                    onPress={() => handleMovePress(move.whiteIndex)}
                    disabled={!onMovePress}
                    style={getMoveStyle(move.whiteIndex)}
                  >
                    <Text style={[
                      styles.moveText,
                      move.whiteIndex % 2 === 0 ? styles.whiteMoveText : styles.blackMoveText,
                      move.whiteIndex === currentMoveIndex && styles.selectedMoveText
                    ]}>
                      {move.white}
                    </Text>
                  </TouchableOpacity>
                )}
                {move.black && move.blackIndex < moves.length && (
                  <TouchableOpacity
                    onPress={() => handleMovePress(move.blackIndex)}
                    disabled={!onMovePress}
                    style={getMoveStyle(move.blackIndex)}
                  >
                    <Text style={[
                      styles.moveText,
                      move.blackIndex % 2 === 0 ? styles.whiteMoveText : styles.blackMoveText,
                      move.blackIndex === currentMoveIndex && styles.selectedMoveText
                    ]}>
                      {move.black}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
        
        {/* 최근 이동 하이라이트 (일반 모드에서만) */}
        {moves.length > 0 && !onMovePress && (
          <View style={styles.lastMoveContainer}>
            <Text style={styles.lastMoveLabel}>마지막 이동:</Text>
            <Text style={styles.lastMove}>
              {moves[moves.length - 1].san}
            </Text>
          </View>
        )}
        
        {/* 현재 위치 표시 (리뷰 모드에서만) */}
        {onMovePress && currentMoveIndex >= 0 && moves[currentMoveIndex] && (
          <View style={styles.currentMoveContainer}>
            <Text style={styles.currentMoveLabel}>현재 수:</Text>
            <Text style={styles.currentMove}>
              {Math.floor(currentMoveIndex / 2) + 1}{currentMoveIndex % 2 === 0 ? '.' : '...'} {moves[currentMoveIndex].san}
            </Text>
          </View>
        )}
      </ScrollView>
      
      {/* 하단 정보 */}
      <View style={[styles.footer, { borderTopColor: currentTheme.colors.border }]}>
        <Text style={[styles.footerText, { color: currentTheme.colors.textSecondary }]}>
          PGN 형식 • {onMovePress ? '터치하여 이동' : '실시간 업데이트'}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  moveCount: {
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 15,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  moveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
  },
  moveNumber: {
    fontSize: 14,
    fontWeight: '600',
    width: 30,
  },
  movesContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  move: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 10,
    borderRadius: 4,
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whiteMove: {
    backgroundColor: '#f0d9b5',
  },
  blackMove: {
    backgroundColor: '#4a4642',
  },
  selectedMove: {
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#2E7D32',
  },
  clickableMove: {
    opacity: 0.9,
  },
  moveText: {
    fontSize: 16,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  whiteMoveText: {
    color: '#000000',
  },
  blackMoveText: {
    color: '#ffffff',
  },
  selectedMoveText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  lastMoveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 10,
    backgroundColor: '#3d3a36',
    borderRadius: 6,
    paddingHorizontal: 10,
  },
  lastMoveLabel: {
    color: '#b0b0b0',
    fontSize: 12,
    marginRight: 8,
  },
  lastMove: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  currentMoveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 10,
    backgroundColor: '#2E7D32',
    borderRadius: 6,
    paddingHorizontal: 10,
  },
  currentMoveLabel: {
    color: '#ffffff',
    fontSize: 12,
    marginRight: 8,
  },
  currentMove: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  footer: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
  },
});

export default GameNotation;