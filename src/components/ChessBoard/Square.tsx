import React from 'react';
import { TouchableOpacity, StyleSheet, Image } from 'react-native';
import { ChessPiece } from '@/types';

interface SquareProps {
  square: string; // 'a1', 'b2' 등
  piece: ChessPiece | null;
  isLight: boolean;
  size: number;
  isSelected?: boolean;
  onPress: (square: string) => void;
}

const Square: React.FC<SquareProps> = ({ 
  square, 
  piece, 
  isLight, 
  size,
  isSelected = false,
  onPress 
}) => {
  const getPieceImage = () => {
    if (!piece) return null;
    
    const color = piece.color === 'white' ? 'White' : 'Black';
    const type = piece.type.charAt(0).toUpperCase() + piece.type.slice(1);
    const imageName = `${color}-${type}`;
    
    // React Native에서 동적 require를 위한 mapping
    const pieceImages: { [key: string]: any } = {
      'White-King': require('../../../assets/pieces/White-King.png'),
      'White-Queen': require('../../../assets/pieces/White-Queen.png'),
      'White-Rook': require('../../../assets/pieces/White-Rook.png'),
      'White-Bishop': require('../../../assets/pieces/White-Bishop.png'),
      'White-Knight': require('../../../assets/pieces/White-Knight.png'),
      'White-Pawn': require('../../../assets/pieces/White-Pawn.png'),
      'Black-King': require('../../../assets/pieces/Black-King.png'),
      'Black-Queen': require('../../../assets/pieces/Black-Queen.png'),
      'Black-Rook': require('../../../assets/pieces/Black-Rook.png'),
      'Black-Bishop': require('../../../assets/pieces/Black-Bishop.png'),
      'Black-Knight': require('../../../assets/pieces/Black-Knight.png'),
      'Black-Pawn': require('../../../assets/pieces/Black-Pawn.png'),
    };

    return pieceImages[imageName];
  };

  return (
    <TouchableOpacity
      style={[
        styles.square,
        {
          width: size,
          height: size,
          backgroundColor: isSelected ? '#ffff00' : (isLight ? '#f0d9b5' : '#b58863'),
        },
      ]}
      onPress={() => onPress(square)}
    >
      {piece && (
        <Image
          source={getPieceImage()}
          style={[styles.piece, { width: size * 0.8, height: size * 0.8 }]}
          resizeMode="contain"
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  square: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
  },
  piece: {
    // 기본 스타일
  },
});

export default Square;