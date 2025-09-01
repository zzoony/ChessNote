import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, StyleSheet, Image, View, Animated } from 'react-native';
import { ChessPiece } from '@/types';

// 기물 이미지를 컴포넌트 외부에서 미리 로드 (성능 최적화)
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

interface SquareProps {
  square: string; // 'a1', 'b2' 등
  piece: ChessPiece | null;
  isLight: boolean;
  size: number;
  isSelected?: boolean;
  isPossibleMove?: boolean;
  isLastMoveSquare?: boolean;
  onPress: (square: string) => void;
  animatingPiece?: ChessPiece | null; // 애니메이션 중인 기물
  isAnimationTarget?: boolean; // 애니메이션 목적지인지
}

const Square: React.FC<SquareProps> = ({ 
  square, 
  piece, 
  isLight, 
  size,
  isSelected = false,
  isPossibleMove = false,
  isLastMoveSquare = false,
  onPress,
  animatingPiece = null,
  isAnimationTarget = false
}) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // 캡처 애니메이션 효과
  useEffect(() => {
    if (isAnimationTarget && piece && animatingPiece) {
      // 기물이 캡처되는 경우 빠르게 페이드 아웃
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    } else {
      // 애니메이션이 끝나면 다시 보이게 하기
      fadeAnim.setValue(1);
    }
  }, [isAnimationTarget, piece, animatingPiece, fadeAnim]);
  const getPieceImage = () => {
    if (!piece) return null;
    
    const color = piece.color === 'white' ? 'White' : 'Black';
    const type = piece.type.charAt(0).toUpperCase() + piece.type.slice(1);
    const imageName = `${color}-${type}`;
    
    return pieceImages[imageName];
  };

  // 배경색 결정
  const getBackgroundColor = () => {
    if (isSelected) return '#ffff00'; // 선택된 기물 (노란색)
    if (isLastMoveSquare) return '#ffcc80'; // 마지막 이동 칸 (연한 오렌지)
    return isLight ? '#f0d9b5' : '#b58863'; // 기본 칸 색상
  };

  return (
    <TouchableOpacity
      style={[
        styles.square,
        {
          width: size,
          height: size,
          backgroundColor: getBackgroundColor(),
        },
      ]}
      onPress={() => onPress(square)}
    >
      {piece && (
        <Animated.View style={{ opacity: fadeAnim }}>
          <Image
            source={getPieceImage()}
            style={[styles.piece, { width: size * 0.8, height: size * 0.8 }]}
            resizeMode="contain"
          />
        </Animated.View>
      )}
      {/* 가능한 이동 위치 점 표시 (기물이 없는 칸) */}
      {isPossibleMove && !piece && (
        <View style={[styles.possibleMoveDot, { 
          width: size * 0.3, 
          height: size * 0.3, 
          borderRadius: size * 0.15 
        }]} />
      )}
      {/* 캡처 가능한 기물 표시 (기물이 있는 칸) */}
      {isPossibleMove && piece && (
        <View style={[styles.captureIndicator, { 
          width: size - 4, 
          height: size - 4,
          borderWidth: 3,
          borderRadius: size * 0.1
        }]} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  square: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    margin: 0,
    padding: 0,
  },
  piece: {
    // 기본 스타일
  },
  possibleMoveDot: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    position: 'absolute',
  },
  captureIndicator: {
    borderColor: 'rgba(255, 0, 0, 0.5)',
    position: 'absolute',
  },
});

export default React.memo(Square, (prevProps, nextProps) => {
  // 성능 최적화를 위한 메모이제이션
  return (
    prevProps.piece === nextProps.piece &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isPossibleMove === nextProps.isPossibleMove &&
    prevProps.isLastMoveSquare === nextProps.isLastMoveSquare &&
    prevProps.isLight === nextProps.isLight &&
    prevProps.size === nextProps.size &&
    prevProps.animatingPiece === nextProps.animatingPiece &&
    prevProps.isAnimationTarget === nextProps.isAnimationTarget
  );
});