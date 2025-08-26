import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { ChessPiece } from '@/types';

interface CapturedPiecesRowProps {
  whitePieces: ChessPiece[];
  blackPieces: ChessPiece[];
}

interface GroupedPiece {
  type: string;
  count: number;
  piece: ChessPiece;
}

const CapturedPiecesRow: React.FC<CapturedPiecesRowProps> = ({ whitePieces, blackPieces }) => {
  // 기물을 타입별로 그룹화하고 개수 계산
  const groupPieces = (pieces: ChessPiece[]) => {
    if (!pieces || !Array.isArray(pieces)) {
      return [];
    }
    
    const groups: { [key: string]: GroupedPiece } = {};
    
    pieces.forEach(piece => {
      if (groups[piece.type]) {
        groups[piece.type].count++;
      } else {
        groups[piece.type] = {
          type: piece.type,
          count: 1,
          piece: piece,
        };
      }
    });
    
    // 기물 가치순으로 정렬 (퀸 → 룩 → 비숍/나이트 → 폰)
    const pieceValues = { queen: 9, rook: 5, bishop: 3, knight: 3, pawn: 1 };
    
    return Object.values(groups).sort((a, b) => 
      (pieceValues[b.type as keyof typeof pieceValues] || 0) - 
      (pieceValues[a.type as keyof typeof pieceValues] || 0)
    );
  };

  const groupedWhitePieces = React.useMemo(() => groupPieces(whitePieces), [whitePieces]);
  const groupedBlackPieces = React.useMemo(() => groupPieces(blackPieces), [blackPieces]);

  const getPieceImage = (piece: ChessPiece) => {
    const pieceColor = piece.color === 'white' ? 'White' : 'Black';
    const pieceType = piece.type.charAt(0).toUpperCase() + piece.type.slice(1);
    const imageName = `${pieceColor}-${pieceType}`;
    
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

  const renderPieceGroup = (group: GroupedPiece, index: number) => (
    <View key={`${group.type}-${index}`} style={styles.pieceGroup}>
      <Image
        source={getPieceImage(group.piece)}
        style={styles.pieceImage}
        resizeMode="contain"
      />
      {group.count > 1 && (
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{group.count}</Text>
        </View>
      )}
    </View>
  );

  // 캡처된 기물이 없으면 최소 높이만 유지
  if (groupedWhitePieces.length === 0 && groupedBlackPieces.length === 0) {
    return <View style={styles.emptyContainer} />;
  }

  return (
    <View style={styles.container}>
      {/* 좌측: 백색 기물 (흑색이 잡은 기물) */}
      <View style={styles.sideContainer}>
        <View style={styles.piecesContainer}>
          {groupedWhitePieces.map(renderPieceGroup)}
        </View>
      </View>

      {/* 중앙 구분선 */}
      <View style={styles.divider} />

      {/* 우측: 흑색 기물 (백색이 잡은 기물) */}
      <View style={styles.sideContainer}>
        <View style={styles.piecesContainer}>
          {groupedBlackPieces.map(renderPieceGroup)}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(240, 217, 181, 0.4)', // 더 진한 베이지색 배경으로 가시성 향상
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 4,
    marginTop: 4,
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 15,
    borderWidth: 1,
    borderColor: 'rgba(139, 69, 19, 0.6)', // 더 진한 테두리
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyContainer: {
    height: 10,
    marginHorizontal: 15,
    marginTop: 8,
  },
  sideContainer: {
    flex: 1,
    alignItems: 'center',
    maxWidth: 150, // 최대 너비 제한
  },
  piecesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    minHeight: 20,
  },
  pieceGroup: {
    position: 'relative',
    marginHorizontal: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieceImage: {
    width: 20,
    height: 20,
    opacity: 1, // 완전 불투명으로 변경
  },
  countBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#d32f2f',
    borderRadius: 6,
    minWidth: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  countText: {
    color: '#fff',
    fontSize: 7,
    fontWeight: 'bold',
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(139, 69, 19, 0.5)',
    marginHorizontal: 6,
  },
});

export default CapturedPiecesRow;
export { CapturedPiecesRow };