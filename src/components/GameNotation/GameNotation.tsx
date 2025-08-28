import React, { useRef, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { ChessMove } from '@/types';

interface GameNotationProps {
  moves: ChessMove[];
  title?: string;
}

const GameNotation: React.FC<GameNotationProps> = ({ 
  moves, 
  title = '기보' 
}) => {
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
  // PGN 형식으로 이동들을 정리
  const formatMoves = () => {
    const formattedMoves = [];
    
    for (let i = 0; i < moves.length; i += 2) {
      const moveNumber = Math.floor(i / 2) + 1;
      const whiteMove = moves[i]?.san || '';
      const blackMove = moves[i + 1]?.san || '';
      
      formattedMoves.push({
        number: moveNumber,
        white: whiteMove,
        black: blackMove,
      });
    }
    
    return formattedMoves;
  };

  const formattedMoves = formatMoves();

  return (
    <View style={styles.container}>
      {/* 제목 */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.moveCount}>
          {moves.length}수 진행
        </Text>
      </View>
      
      {/* 기보 내용 */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {formattedMoves.length === 0 ? (
          <Text style={styles.emptyText}>
            체스 기물을 움직여서 기보를 시작하세요
          </Text>
        ) : (
          formattedMoves.map((move, index) => (
            <View key={index} style={styles.moveRow}>
              <Text style={styles.moveNumber}>{move.number}.</Text>
              <View style={styles.movesContainer}>
                <Text style={[styles.move, styles.whiteMove]}>
                  {move.white}
                </Text>
                {move.black && (
                  <Text style={[styles.move, styles.blackMove]}>
                    {move.black}
                  </Text>
                )}
              </View>
            </View>
          ))
        )}
        
        {/* 최근 이동 하이라이트 */}
        {moves.length > 0 && (
          <View style={styles.lastMoveContainer}>
            <Text style={styles.lastMoveLabel}>마지막 이동:</Text>
            <Text style={styles.lastMove}>
              {moves[moves.length - 1].san}
            </Text>
          </View>
        )}
      </ScrollView>
      
      {/* 하단 정보 */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          PGN 형식 • 실시간 업데이트
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2a2724',
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
    borderBottomColor: '#3d3a36',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  moveCount: {
    fontSize: 12,
    color: '#b0b0b0',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 15,
  },
  emptyText: {
    color: '#888',
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
    borderBottomColor: '#3d3a36',
  },
  moveNumber: {
    color: '#b0b0b0',
    fontSize: 14,
    fontWeight: '600',
    width: 30,
  },
  movesContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  move: {
    fontSize: 16,
    fontFamily: 'monospace',
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 10,
    borderRadius: 4,
    minWidth: 50,
    textAlign: 'center',
  },
  whiteMove: {
    color: '#000000',
    backgroundColor: '#f0d9b5',
  },
  blackMove: {
    color: '#ffffff',
    backgroundColor: '#4a4642',
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
  footer: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#3d3a36',
    alignItems: 'center',
  },
  footerText: {
    color: '#888',
    fontSize: 10,
  },
});

export default GameNotation;