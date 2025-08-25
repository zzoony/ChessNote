import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert, ActionSheetIOS, Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import Clipboard from '@react-native-clipboard/clipboard';
import { useGame } from '@/context/GameContext';
import { generatePGN } from '@/utils/chessLogic';

const GameControls: React.FC = () => {
  const { gameState, newGame, undoMove } = useGame();
  
  const handleNewGame = () => {
    if (gameState.moves.length > 0) {
      Alert.alert(
        '새 게임',
        '현재 진행 중인 게임을 종료하고 새 게임을 시작하시겠습니까?',
        [
          {
            text: '취소',
            style: 'cancel',
          },
          {
            text: '새 게임 시작',
            onPress: newGame,
          },
        ]
      );
    } else {
      newGame();
    }
  };
  
  const handleUndo = () => {
    if (gameState.moves.length === 0) {
      Alert.alert('되돌리기', '되돌릴 수가 없습니다.');
      return;
    }
    
    undoMove();
  };
  
  const handleCopyToClipboard = async () => {
    try {
      const pgnContent = generatePGNFile(gameState);
      Clipboard.setString(pgnContent);
      Alert.alert('복사 완료', 'PGN 기보가 클립보드에 복사되었습니다.');
    } catch (error) {
      console.error('클립보드 복사 오류:', error);
      Alert.alert('오류', '클립보드 복사 중 오류가 발생했습니다.');
    }
  };

  const handleShareFile = async () => {
    try {
      // PGN 내용 생성
      const pgnContent = generatePGNFile(gameState);
      
      // 파일 이름 생성
      const fileName = `chess_game_${Date.now()}.pgn`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      // 파일 저장
      await FileSystem.writeAsStringAsync(fileUri, pgnContent);
      
      // 공유 가능 여부 확인
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/x-chess-pgn',
          dialogTitle: '체스 기보 공유',
        });
      } else {
        Alert.alert('공유하기', '이 디바이스에서는 공유 기능을 사용할 수 없습니다.');
      }
    } catch (error) {
      console.error('파일 공유 오류:', error);
      Alert.alert('오류', '파일 공유 중 오류가 발생했습니다.');
    }
  };

  const handleShare = () => {
    if (gameState.moves.length === 0) {
      Alert.alert('공유하기', '공유할 기보가 없습니다.');
      return;
    }

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['취소', '클립보드에 복사', '파일로 공유'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleCopyToClipboard();
          } else if (buttonIndex === 2) {
            handleShareFile();
          }
        }
      );
    } else {
      // Android의 경우 Alert로 대체
      Alert.alert(
        '공유 옵션',
        '어떤 방식으로 공유하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          { text: '클립보드에 복사', onPress: handleCopyToClipboard },
          { text: '파일로 공유', onPress: handleShareFile },
        ]
      );
    }
  };
  
  // PGN 파일 내용 생성
  const generatePGNFile = (gameState: any): string => {
    let pgn = '';
    
    // 헤더 정보
    pgn += `[Event "ChessNote Game"]\n`;
    pgn += `[Site "Mobile App"]\n`;
    pgn += `[Date "${gameState.headers.Date}"]\n`;
    pgn += `[White "${gameState.headers.White}"]\n`;
    pgn += `[Black "${gameState.headers.Black}"]\n`;
    pgn += `[Result "${gameState.headers.Result}"]\n`;
    pgn += '\n';
    
    // 이동 내용
    pgn += generatePGN(gameState.moves);
    pgn += ` ${gameState.headers.Result}`;
    
    return pgn;
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.button, styles.newGameButton]}
        onPress={handleNewGame}
      >
        <Text style={styles.buttonText}>새 게임</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.button, 
          styles.undoButton,
          gameState.moves.length === 0 && styles.buttonDisabled
        ]}
        onPress={handleUndo}
        disabled={gameState.moves.length === 0}
      >
        <Text style={[
          styles.buttonText,
          gameState.moves.length === 0 && styles.buttonTextDisabled
        ]}>
          되돌리기
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.button, 
          styles.shareButton,
          gameState.moves.length === 0 && styles.buttonDisabled
        ]}
        onPress={handleShare}
        disabled={gameState.moves.length === 0}
      >
        <Text style={[
          styles.buttonText,
          gameState.moves.length === 0 && styles.buttonTextDisabled
        ]}>
          공유하기
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#312e2b',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 90,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  newGameButton: {
    backgroundColor: '#4CAF50', // 초록색
  },
  undoButton: {
    backgroundColor: '#FF9800', // 주황색
  },
  shareButton: {
    backgroundColor: '#2196F3', // 파란색
  },
  buttonDisabled: {
    backgroundColor: '#555',
    opacity: 0.5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonTextDisabled: {
    color: '#aaa',
  },
});

export default GameControls;