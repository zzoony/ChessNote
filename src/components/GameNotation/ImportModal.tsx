import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { 
  Modal, 
  Portal, 
  Text, 
  Button, 
  TextInput, 
  Card, 
  IconButton,
  Divider
} from 'react-native-paper';
import * as FileSystem from 'expo-file-system';
import { useGame } from '@/context/GameContext';
import { parsePGNString } from '@/utils/pgnParser';

interface ImportModalProps {
  visible: boolean;
  onDismiss: () => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ visible, onDismiss }) => {
  const [pgnText, setPgnText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { loadGame, setGameMode } = useGame();

  // PGN 텍스트 처리
  const handleImportPGN = async () => {
    if (!pgnText.trim()) {
      Alert.alert('오류', 'PGN 텍스트를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const parsedGame = parsePGNString(pgnText.trim());
      if (!parsedGame) {
        Alert.alert('오류', 'PGN 형식이 올바르지 않습니다.');
        return;
      }

      loadGame(parsedGame);
      setGameMode('analysis');
      Alert.alert('성공', `게임을 불러왔습니다. (${parsedGame.totalMoves}수)`);
      setPgnText('');
      onDismiss();
    } catch (error) {
      console.error('PGN 가져오기 오류:', error);
      Alert.alert('오류', 'PGN을 처리하는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 클립보드에서 PGN 가져오기
  const handlePasteFromClipboard = () => {
    Alert.alert(
      '클립보드', 
      '클립보드에서 PGN을 가져오시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '가져오기', 
          onPress: () => {
            // 실제로는 expo-clipboard를 사용해야 하지만 
            // 현재는 텍스트 입력을 통해 진행
            Alert.alert('안내', 'PGN 텍스트를 아래 입력창에 직접 붙여넣어 주세요.');
          }
        }
      ]
    );
  };

  // 라이브 모드로 돌아가기
  const handleBackToLiveMode = () => {
    setGameMode('live');
    onDismiss();
  };

  // 예제 PGN 삽입
  const handleInsertExample = () => {
    const examplePGN = `[Event "Example Game"]
[Site "ChessNote"]
[Date "2025.09.01"]
[White "Player 1"]
[Black "Player 2"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Bb7 10. d4 Re8 11. Nbd2 Bf8 12. a4 h6 13. Bc2 exd4 14. cxd4 Nb4 15. Bb1 c5 16. d5 Nd7 17. Ra3 f5 18. Rae3 Nf6 19. Nh4 fxe4 20. Nxe4 Nxe4 21. Bxe4 Bxd5 22. Bxd5+ Nxd5 23. Re7 1-0`;
    setPgnText(examplePGN);
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <Card style={styles.card}>
          <Card.Title 
            title="게임 가져오기" 
            subtitle="PGN 파일 또는 텍스트를 가져와서 분석하세요"
            left={(props) => <IconButton {...props} icon="file-import" />}
            right={(props) => <IconButton {...props} icon="close" onPress={onDismiss} />}
          />
          
          <Card.Content>
            {/* 파일 선택 버튼 */}
            <View style={styles.buttonRow}>
              <Button
                mode="contained-tonal"
                icon="content-paste"
                onPress={handlePasteFromClipboard}
                disabled={isLoading}
                style={styles.fileButton}
              >
                클립보드에서 가져오기
              </Button>
              
              <Button
                mode="outlined"
                icon="lightbulb"
                onPress={handleInsertExample}
                disabled={isLoading}
                style={styles.exampleButton}
              >
                예제
              </Button>
            </View>

            <Divider style={styles.divider} />

            {/* PGN 텍스트 입력 */}
            <Text style={styles.label}>또는 PGN 텍스트 직접 입력:</Text>
            <TextInput
              mode="outlined"
              value={pgnText}
              onChangeText={setPgnText}
              placeholder="PGN 텍스트를 여기에 붙여넣으세요..."
              multiline
              numberOfLines={8}
              style={styles.textInput}
              disabled={isLoading}
            />

            {/* 액션 버튼들 */}
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                icon="import"
                onPress={handleImportPGN}
                disabled={isLoading || !pgnText.trim()}
                loading={isLoading}
                style={styles.importButton}
              >
                분석 모드로 가져오기
              </Button>
              
              <Button
                mode="text"
                onPress={handleBackToLiveMode}
                disabled={isLoading}
                style={styles.liveButton}
              >
                라이브 모드로 돌아가기
              </Button>
            </View>
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#2a2724',
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  fileButton: {
    flex: 2,
  },
  exampleButton: {
    flex: 1,
  },
  divider: {
    marginVertical: 16,
    backgroundColor: '#3d3a36',
  },
  label: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: '#1a1916',
    marginBottom: 20,
    color: '#ffffff',
  },
  actionButtons: {
    gap: 12,
  },
  importButton: {
    backgroundColor: '#4CAF50',
  },
  liveButton: {
    marginTop: 8,
  },
});

export default ImportModal;