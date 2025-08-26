import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet } from 'react-native';
import { ChessPiece } from '@/types';

interface PromotionAnimatedPieceProps {
  fromPiece: ChessPiece;
  toPiece: ChessPiece;
  square: string;
  squareSize: number;
  onAnimationComplete: () => void;
}

// 체스 좌표를 픽셀 위치로 변환
const squareToPosition = (square: string, squareSize: number) => {
  const file = square.charCodeAt(0) - 97; // a=0, b=1, ..., h=7
  const rank = parseInt(square[1]) - 1; // 1=0, 2=1, ..., 8=7
  
  return {
    x: file * squareSize,
    y: (7 - rank) * squareSize, // 체스보드는 8랭크가 맨 위
  };
};

const PromotionAnimatedPiece: React.FC<PromotionAnimatedPieceProps> = ({
  fromPiece,
  toPiece,
  square,
  squareSize,
  onAnimationComplete,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeOutAnim = useRef(new Animated.Value(1)).current;
  const fadeInAnim = useRef(new Animated.Value(0)).current;
  
  const getPieceImage = (piece: ChessPiece) => {
    const color = piece.color === 'white' ? 'White' : 'Black';
    const type = piece.type.charAt(0).toUpperCase() + piece.type.slice(1);
    const imageName = `${color}-${type}`;
    
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

  useEffect(() => {
    const position = squareToPosition(square, squareSize);
    
    // 프로모션 애니메이션: 확대 → 페이드아웃 → 페이드인
    Animated.sequence([
      // 1. 기존 기물 확대
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      // 2. 페이드아웃
      Animated.timing(fadeOutAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
      // 3. 새 기물 페이드인과 동시에 스케일 정상화
      Animated.parallel([
        Animated.timing(fadeInAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      onAnimationComplete();
    });
  }, [square, squareSize, scaleAnim, fadeOutAnim, fadeInAnim, onAnimationComplete]);

  const position = squareToPosition(square, squareSize);

  return (
    <>
      {/* 기존 기물 (페이드아웃) */}
      <Animated.View
        style={[
          styles.animatedPiece,
          {
            transform: [
              { translateX: position.x },
              { translateY: position.y },
              { scale: scaleAnim },
            ],
            opacity: fadeOutAnim,
          },
        ]}
      >
        <Image
          source={getPieceImage(fromPiece)}
          style={[styles.piece, { width: squareSize * 0.8, height: squareSize * 0.8 }]}
          resizeMode="contain"
        />
      </Animated.View>
      
      {/* 새 기물 (페이드인) */}
      <Animated.View
        style={[
          styles.animatedPiece,
          {
            transform: [
              { translateX: position.x },
              { translateY: position.y },
              { scale: scaleAnim },
            ],
            opacity: fadeInAnim,
          },
        ]}
      >
        <Image
          source={getPieceImage(toPiece)}
          style={[styles.piece, { width: squareSize * 0.8, height: squareSize * 0.8 }]}
          resizeMode="contain"
        />
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  animatedPiece: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  piece: {
    // 기본 스타일
  },
});

export default PromotionAnimatedPiece;