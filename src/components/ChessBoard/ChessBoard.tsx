import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import Square from './Square';
import PromotionDialog from './PromotionDialog';
import AnimatedPiece from './AnimatedPiece';
import { ChessPiece, BoardPosition } from '@/types';
import { useGame } from '@/context/GameContext';

const { width: screenWidth } = Dimensions.get('window');
const SQUARE_SIZE = Math.floor(Math.min(screenWidth * 0.9, 400) / 8); // 정확한 픽셀 정렬을 위해 floor 사용
const BOARD_SIZE = SQUARE_SIZE * 8; // 정확히 8개의 정사각형 크기

interface ChessBoardProps {
  position?: BoardPosition;
  onMove?: (from: string, to: string) => void;
}

const ChessBoard: React.FC<ChessBoardProps> = ({ position, onMove }) => {
  const { 
    gameState, 
    position: contextPosition, 
    selectedSquare,
    possibleMoves,
    lastMove,
    makeMove,
    setSelectedSquare,
    isWhiteInCheck,
    isBlackInCheck,
    isGameOver,
    gameResult,
    pendingPromotion,
    animationState,
    onAnimationComplete
  } = useGame();
  const currentPosition = position || contextPosition;

  const handleSquarePress = (square: string) => {
    // 애니메이션 중에는 사용자 입력 차단
    if (animationState.isAnimating) {
      return;
    }
    
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
      // 두 번째 클릭 - 이동 또는 새로운 기물 선택
      if (selectedSquare === square) {
        // 같은 칸을 다시 클릭하면 선택 해제
        setSelectedSquare(null);
      } else {
        const targetPiece = currentPosition[square];
        // 자신의 기물을 클릭한 경우 새로운 선택
        if (targetPiece && targetPiece.color === gameState.currentPlayer) {
          setSelectedSquare(square);
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
        }
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
        const isLight = (file + rank) % 2 === 0;
        const piece = currentPosition[square];
        const isSelected = selectedSquare === square;
        const isPossibleMove = possibleMoves.includes(square);
        const isLastMoveSquare = lastMove ? (square === lastMove.from || square === lastMove.to) : false;
        
        // 애니메이션 중인 기물 처리
        const isAnimationSource = animationState.animatingMoves.some(move => move.from === square);
        const isAnimationTarget = animationState.animatingMoves.some(move => move.to === square);
        const animatingPiece = animationState.animatingMoves.find(move => move.to === square)?.piece || null;
        const displayPiece = isAnimationSource ? null : piece; // 애니메이션 시작 위치에서는 기물 숨김
        
        squares.push(
          <Square
            key={square}
            square={square}
            piece={displayPiece}
            isLight={isLight}
            size={SQUARE_SIZE}
            isSelected={isSelected}
            isPossibleMove={isPossibleMove}
            isLastMoveSquare={isLastMoveSquare}
            onPress={handleSquarePress}
            animatingPiece={animatingPiece}
            isAnimationTarget={isAnimationTarget}
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

  // 게임 상태 텍스트 생성
  const getStatusText = () => {
    if (isGameOver) {
      if (gameState.gameStatus === 'checkmate') {
        const winner = gameResult === '1-0' ? '백색' : '흑색';
        return `체크메이트! ${winner} 승리`;
      } else if (gameState.gameStatus === 'stalemate') {
        return '스테일메이트! 무승부';
      }
    }
    
    if (isWhiteInCheck && gameState.currentPlayer === 'white') {
      return '백색 킹이 체크 상태입니다!';
    } else if (isBlackInCheck && gameState.currentPlayer === 'black') {
      return '흑색 킹이 체크 상태입니다!';
    }
    
    return gameState.currentPlayer === 'white' ? '백 차례' : '흑 차례';
  };

  // 프로모션 처리
  const handlePromotion = (pieceType: 'queen' | 'rook' | 'bishop' | 'knight') => {
    if (pendingPromotion) {
      makeMove(pendingPromotion.from, pendingPromotion.to, pieceType);
    }
  };

  const handlePromotionCancel = () => {
    // 프로모션을 취소하는 경우, 아무 동작하지 않음 (게임 상태는 그대로 유지)
  };

  return (
    <View style={styles.container}>
      {/* 체스보드와 좌표 컨테이너 */}
      <View style={styles.boardContainer}>
        {/* 세로 좌표 (1-8) */}
        <View style={[styles.rankLabels, { height: BOARD_SIZE }]}>
          {[8, 7, 6, 5, 4, 3, 2, 1].map((rank) => (
            <View key={rank} style={[styles.rankLabel, { height: SQUARE_SIZE }]}>
              <Text style={styles.coordinateText}>{rank}</Text>
            </View>
          ))}
        </View>
        
        {/* 체스보드 */}
        <View style={styles.boardWrapper}>
          <View style={[styles.board, { width: BOARD_SIZE, height: BOARD_SIZE }]}>
            {renderBoard()}
            
            {/* 애니메이션 레이어 */}
            {animationState && animationState.isAnimating && animationState.animatingMoves.map((move, index) => (
              <AnimatedPiece
                key={`${move.from}-${move.to}-${index}`}
                piece={move.piece}
                fromSquare={move.from}
                toSquare={move.to}
                boardSize={BOARD_SIZE}
                squareSize={SQUARE_SIZE}
                onAnimationComplete={onAnimationComplete}
                delay={index * 100} // 여러 기물이 이동할 때 순서대로 애니메이션
              />
            ))}
          </View>
          
          {/* 가로 좌표 (A-H) */}
          <View style={styles.fileLabels}>
            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((file) => (
              <View key={file} style={[styles.fileLabel, { width: SQUARE_SIZE }]}>
                <Text style={styles.coordinateText}>{file}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      
      {/* 프로모션 다이얼로그 */}
      {pendingPromotion && (
        <PromotionDialog
          color={gameState.currentPlayer}
          onSelect={handlePromotion}
          onCancel={handlePromotionCancel}
        />
      )}
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
  checkWarning: {
    color: '#d32f2f',
    backgroundColor: '#ffebee',
    padding: 8,
    borderRadius: 4,
  },
  gameOver: {
    color: '#1976d2',
    backgroundColor: '#e3f2fd',
    padding: 8,
    borderRadius: 4,
  },
  boardContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginLeft: -14,
  },
  rankLabels: {
    marginRight: 2,
    justifyContent: 'flex-start',
  },
  rankLabel: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 20,
    flex: 1,
  },
  boardWrapper: {
    alignItems: 'center',
  },
  board: {
    borderWidth: 0,
    overflow: 'hidden',
  },
  fileLabels: {
    flexDirection: 'row',
    marginTop: 4,
  },
  fileLabel: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 20,
  },
  coordinateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  row: {
    flexDirection: 'row',
    margin: 0,
    padding: 0,
    gap: 0,
  },
});

export default ChessBoard;