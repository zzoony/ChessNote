import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet } from 'react-native';
import { ChessPiece } from '@/types';

interface AnimatedPieceProps {
  piece: ChessPiece;
  fromSquare: string;
  toSquare: string;
  boardSize: number;
  squareSize: number;
  onAnimationComplete: () => void;
  delay?: number; // 캐슬링 등에서 여러 기물이 동시에 이동할 때 지연 시간
}

// 체스 좌표를 픽셀 위치로 변환 (칸의 중앙 기준)
const squareToPosition = (square: string, squareSize: number) => {
  const file = square.charCodeAt(0) - 97; // a=0, b=1, ..., h=7
  const rank = parseInt(square[1]) - 1; // 1=0, 2=1, ..., 8=7
  
  // Square 컴포넌트와 정확히 매칭: 칸 좌상단 + 기물 크기 80%의 10% 여백 보상
  return {
    x: file * squareSize + (squareSize - squareSize * 0.8) / 2, // 칸 중앙 정렬
    y: (7 - rank) * squareSize + (squareSize - squareSize * 0.8) / 2, // 체스보드는 8랭크가 맨 위
  };
};

const AnimatedPiece: React.FC<AnimatedPieceProps> = ({
  piece,
  fromSquare,
  toSquare,
  boardSize,
  squareSize,
  onAnimationComplete,
  delay = 0,
}) => {
  const positionAnim = useRef(new Animated.ValueXY()).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowOpacityAnim = useRef(new Animated.Value(0)).current;
  
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

  useEffect(() => {
    const fromPosition = squareToPosition(fromSquare, squareSize);
    const toPosition = squareToPosition(toSquare, squareSize);
    
    // 초기값 설정을 requestAnimationFrame으로 지연
    requestAnimationFrame(() => {
      positionAnim.setValue(fromPosition);
      scaleAnim.setValue(1);
      shadowOpacityAnim.setValue(0);
    });
    
    // 지연 시간 후 애니메이션 시작
    const timer = setTimeout(() => {
      Animated.parallel([
        // 위치 이동 애니메이션 - 이동 거리에 따라 속도 조절 (20% 더 빠르게)
        Animated.timing(positionAnim, {
          toValue: toPosition,
          duration: Math.max(200, Math.min(320, 
            Math.sqrt(Math.pow(toPosition.x - fromPosition.x, 2) + Math.pow(toPosition.y - fromPosition.y, 2)) * 1.44
          )),
          useNativeDriver: true,
        }),
        // 그림자 효과 (이동 시 나타나고 끝에서 사라짐, 20% 빠르게)
        Animated.sequence([
          Animated.timing(shadowOpacityAnim, {
            toValue: 0.3,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(shadowOpacityAnim, {
            toValue: 0,
            duration: 160,
            useNativeDriver: true,
          }),
        ]),
        // 살짝 커졌다가 작아지는 효과 (20% 빠르게)
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 240,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        // 애니메이션 완료 콜백
        onAnimationComplete();
      });
    }, delay);
    
    return () => clearTimeout(timer);
  }, [fromSquare, toSquare, squareSize, onAnimationComplete, delay]);

  return (
    <>
      {/* 그림자 효과 */}
      <Animated.View
        style={[
          styles.shadowPiece,
          {
            width: squareSize * 0.8,
            height: squareSize * 0.8,
            transform: [
              { translateX: positionAnim.x },
              { translateY: positionAnim.y },
              { scale: scaleAnim },
              { translateY: 3 }, // 약간 아래로 이동
            ],
            opacity: shadowOpacityAnim,
          },
        ]}
      >
        <Image
          source={getPieceImage()}
          style={[styles.piece, { width: squareSize * 0.8, height: squareSize * 0.8 }]}
          resizeMode="contain"
        />
      </Animated.View>
      
      {/* 실제 기물 */}
      <Animated.View
        style={[
          styles.animatedPiece,
          {
            width: squareSize * 0.8,
            height: squareSize * 0.8,
            transform: [
              { translateX: positionAnim.x },
              { translateY: positionAnim.y },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <Image
          source={getPieceImage()}
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
    zIndex: 1000, // 다른 모든 기물 위에 표시
    justifyContent: 'center',
    alignItems: 'center',
  },
  shadowPiece: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 999, // 실제 기물보다 아래
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // 그림자 효과 강화
  },
  piece: {
    // 기본 스타일
  },
});

export default AnimatedPiece;