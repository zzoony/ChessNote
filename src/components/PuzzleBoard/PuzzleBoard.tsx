import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { ChessPiece, BoardPosition } from '@/types';

const { width: screenWidth } = Dimensions.get('window');
const SQUARE_SIZE = Math.floor(Math.min(screenWidth * 0.9, 400) / 8);
const BOARD_SIZE = SQUARE_SIZE * 8;

interface PuzzleBoardProps {
  position: BoardPosition;
  onMove: (from: string, to: string, promotion?: 'queen' | 'rook' | 'bishop' | 'knight') => void;
  possibleMoves: string[];
  lastMove?: { from: string; to: string } | null;
  disabled?: boolean;
  size?: number;
}

// 기물 유니코드 매핑
const PIECE_SYMBOLS = {
  'white': {
    king: '♔',
    queen: '♕', 
    rook: '♖',
    bishop: '♗',
    knight: '♘',
    pawn: '♙'
  },
  'black': {
    king: '♚',
    queen: '♛',
    rook: '♜', 
    bishop: '♝',
    knight: '♞',
    pawn: '♟'
  }
};

const PuzzleSquare: React.FC<{
  square: string;
  piece: ChessPiece | null;
  isSelected: boolean;
  isPossibleMove: boolean;
  isLastMove: boolean;
  onPress: () => void;
  disabled: boolean;
}> = ({ square, piece, isSelected, isPossibleMove, isLastMove, onPress, disabled }) => {
  const file = square.charCodeAt(0) - 97; // a=0, b=1, ...
  const rank = parseInt(square[1]) - 1; // 1=0, 2=1, ...
  const isDarkSquare = (file + rank) % 2 === 1;

  let backgroundColor = isDarkSquare ? '#b58863' : '#f0d9b5';
  
  if (isSelected) {
    backgroundColor = '#f7ec74';
  } else if (isLastMove) {
    backgroundColor = '#ddd40c';
  } else if (isPossibleMove) {
    backgroundColor = isDarkSquare ? '#9f8a63' : '#e0c9a5';
  }

  return (
    <View
      style={[
        styles.square,
        { backgroundColor }
      ]}
      onTouchEnd={disabled ? undefined : onPress}
    >
      {piece && (
        <View style={styles.piece}>
          <Text style={styles.pieceText}>
            {PIECE_SYMBOLS[piece.color][piece.type]}
          </Text>
        </View>
      )}
      {isPossibleMove && !piece && (
        <View style={styles.possibleMoveIndicator} />
      )}
    </View>
  );
};

const PuzzleBoard: React.FC<PuzzleBoardProps> = ({
  position,
  onMove,
  possibleMoves,
  lastMove = null,
  disabled = false,
  size = BOARD_SIZE
}) => {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);

  const handleSquarePress = (square: string) => {
    if (disabled) return;

    if (selectedSquare === null) {
      // 첫 번째 클릭 - 기물 선택
      const piece = position[square];
      if (piece) {
        setSelectedSquare(square);
      }
    } else {
      // 두 번째 클릭 - 이동 또는 새로운 기물 선택
      if (selectedSquare === square) {
        // 같은 칸을 다시 클릭하면 선택 해제
        setSelectedSquare(null);
      } else {
        const targetPiece = position[square];
        const selectedPiece = position[selectedSquare];
        
        // 자신의 기물을 클릭한 경우 새로운 선택 (같은 색상이면)
        if (targetPiece && selectedPiece && targetPiece.color === selectedPiece.color) {
          setSelectedSquare(square);
        } else {
          // 이동 시도
          onMove(selectedSquare, square);
          setSelectedSquare(null);
        }
      }
    }
  };

  const getSquareName = (file: number, rank: number): string => {
    return String.fromCharCode(97 + file) + (rank + 1);
  };

  const squareSize = size / 8;

  const renderSquares = () => {
    const squares = [];
    
    // 8x8 보드 렌더링 (rank 7부터 0까지, file 0부터 7까지)
    for (let rank = 7; rank >= 0; rank--) {
      for (let file = 0; file < 8; file++) {
        const square = getSquareName(file, rank);
        const piece = position[square] || null;
        const isSelected = selectedSquare === square;
        const isPossibleMove = possibleMoves.includes(square);
        const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square);
        
        squares.push(
          <View
            key={square}
            style={[
              styles.squareContainer,
              {
                width: squareSize,
                height: squareSize,
                left: file * squareSize,
                top: (7 - rank) * squareSize
              }
            ]}
          >
            <PuzzleSquare
              square={square}
              piece={piece}
              isSelected={isSelected}
              isPossibleMove={isPossibleMove}
              isLastMove={!!isLastMove}
              onPress={() => handleSquarePress(square)}
              disabled={disabled}
            />
          </View>
        );
      }
    }
    
    return squares;
  };

  return (
    <View style={[styles.board, { width: size, height: size }]}>
      {renderSquares()}
    </View>
  );
};

const styles = StyleSheet.create({
  board: {
    position: 'relative',
    borderWidth: 2,
    borderColor: '#8b4513',
  },
  squareContainer: {
    position: 'absolute',
  },
  square: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  piece: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
    height: '80%',
  },
  pieceText: {
    fontSize: Math.floor(SQUARE_SIZE * 0.7),
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
    lineHeight: Math.floor(SQUARE_SIZE * 0.8),
  },
  possibleMoveIndicator: {
    width: '30%',
    height: '30%',
    borderRadius: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
});

export default PuzzleBoard;