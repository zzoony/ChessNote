import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import Square from './Square';
import PromotionDialog from './PromotionDialog';
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
  const { 
    gameState, 
    position: contextPosition, 
    makeMove,
    isWhiteInCheck,
    isBlackInCheck,
    isGameOver,
    gameResult,
    pendingPromotion
  } = useGame();
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
        const isLight = (file + rank) % 2 === 0;
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
    
    return gameState.currentPlayer === 'white' ? '백색 차례' : '흑색 차례';
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
      <Text style={[
        styles.turnIndicator,
        (isWhiteInCheck || isBlackInCheck) && !isGameOver && styles.checkWarning,
        isGameOver && styles.gameOver
      ]}>
        {getStatusText()}
      </Text>
      
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
  },
  rankLabels: {
    marginRight: 4,
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
    borderWidth: 2,
    borderColor: '#8b4513',
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
  },
});

export default ChessBoard;