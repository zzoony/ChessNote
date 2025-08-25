import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { PieceColor } from '@/types';

interface PromotionDialogProps {
  color: PieceColor;
  onSelect: (piece: 'queen' | 'rook' | 'bishop' | 'knight') => void;
  onCancel: () => void;
}

const PromotionDialog: React.FC<PromotionDialogProps> = ({ color, onSelect, onCancel }) => {
  const pieces = [
    { type: 'queen' as const, label: '퀸' },
    { type: 'rook' as const, label: '룩' },
    { type: 'bishop' as const, label: '비숍' },
    { type: 'knight' as const, label: '나이트' },
  ];

  const getPieceImage = (pieceType: 'queen' | 'rook' | 'bishop' | 'knight') => {
    const colorPrefix = color === 'white' ? 'White' : 'Black';
    
    const imageMap = {
      'white-queen': require('../../../assets/pieces/White-Queen.png'),
      'white-rook': require('../../../assets/pieces/White-Rook.png'),
      'white-bishop': require('../../../assets/pieces/White-Bishop.png'),
      'white-knight': require('../../../assets/pieces/White-Knight.png'),
      'black-queen': require('../../../assets/pieces/Black-Queen.png'),
      'black-rook': require('../../../assets/pieces/Black-Rook.png'),
      'black-bishop': require('../../../assets/pieces/Black-Bishop.png'),
      'black-knight': require('../../../assets/pieces/Black-Knight.png'),
    };
    
    const key = `${color}-${pieceType}` as keyof typeof imageMap;
    return imageMap[key];
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.dialog}>
        <Text style={styles.title}>프로모션 선택</Text>
        <Text style={styles.subtitle}>폰을 어떤 기물로 승격시킬까요?</Text>
        
        <View style={styles.piecesContainer}>
          {pieces.map((piece) => (
            <TouchableOpacity
              key={piece.type}
              style={styles.pieceButton}
              onPress={() => onSelect(piece.type)}
            >
              <Image 
                source={getPieceImage(piece.type)}
                style={styles.pieceImage}
                resizeMode="contain"
              />
              <Text style={styles.pieceLabel}>{piece.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelText}>취소</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  dialog: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    minWidth: 300,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  piecesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
  },
  pieceButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    minWidth: 60,
  },
  pieceImage: {
    width: 40,
    height: 40,
    marginBottom: 4,
  },
  pieceLabel: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
  },
  cancelText: {
    fontSize: 14,
    color: '#666',
  },
});

export default PromotionDialog;