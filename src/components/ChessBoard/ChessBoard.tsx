import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import Square from './Square';
import { ChessPiece, PieceColor, BoardPosition } from '@/types';
import { useGame } from '@/context/GameContext';

const { width: screenWidth } = Dimensions.get('window');
const BOARD_SIZE = Math.min(screenWidth * 0.9, 400);
const SQUARE_SIZE = BOARD_SIZE / 8;

interface ChessBoardProps {
  position?: BoardPosition;
  onMove?: (from: string, to: string) => void;
}

const ChessBoard: React.FC<ChessBoardProps> = ({ position, onMove }) => {
  const { gameState, position: contextPosition, makeMove } = useGame();
  const currentPosition = position || contextPosition;
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);

  const handleSquarePress = (square: string) => {
    if (selectedSquare === null) {
      // 첫 번째 클릭 - 기물 선택
      const piece = currentPosition[square];
      if (piece !== null) {
        // 현재 턴인 기물만 선택 가능
        if (piece.color === gameState.currentPlayer) {
          setSelectedSquare(square);
        }
      }
    } else {
      // 두 번째 클릭 - 이동
      if (selectedSquare === square) {
        // 같은 칸을 다시 클릭하면 선택 해제
        setSelectedSquare(null);
      } else {
        // 이동 시도
        const selectedPiece = currentPosition[selectedSquare];
        if (selectedPiece && selectedPiece.color === gameState.currentPlayer) {
          if (onMove) {
            onMove(selectedSquare, square);
          } else {
            // GameContext를 사용한 이동
            makeMove(selectedSquare, square);
          }
        }
        setSelectedSquare(null);
      }
    }
  };

  const renderBoard = () => {
    const rows = [];
    
    // 8랭크부터 1랭크까지 (위에서 아래로)
    for (let rank = 8; rank >= 1; rank--) {
      const squares = [];
      for (let file = 0; file < 8; file++) {
        const square = String.fromCharCode(97 + file) + rank;
        const isLight = (file + rank) % 2 === 1;
        const piece = currentPosition[square];
        const isSelected = selectedSquare === square;
        
        squares.push(
          <Square
            key={square}
            square={square}
            piece={piece}
            isLight={isLight}
            size={SQUARE_SIZE}
            isSelected={isSelected}
            onPress={handleSquarePress}
          />
        );
      }
      
      rows.push(
        <View key={rank} style={styles.row}>
          {squares}
        </View>
      );
    }
    
    return rows;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.turnIndicator}>
        {gameState.currentPlayer === 'white' ? '백색 차례' : '흑색 차례'}
      </Text>
      <View style={[styles.board, { width: BOARD_SIZE, height: BOARD_SIZE }]}>
        {renderBoard()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  turnIndicator: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  board: {
    borderWidth: 2,
    borderColor: '#8b4513',
  },
  row: {
    flexDirection: 'row',
  },
});

export default ChessBoard;