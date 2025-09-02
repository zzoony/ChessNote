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
import * as Clipboard from 'expo-clipboard';
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
  const handlePasteFromClipboard = async () => {
    try {
      const clipboardText = await Clipboard.getStringAsync();
      if (clipboardText.trim()) {
        setPgnText(clipboardText.trim());
        Alert.alert('성공', '클립보드에서 PGN을 가져왔습니다.');
      } else {
        Alert.alert('오류', '클립보드에 텍스트가 없습니다.');
      }
    } catch (error) {
      console.error('클립보드 읽기 오류:', error);
      Alert.alert('오류', '클립보드에서 텍스트를 가져올 수 없습니다.');
    }
  };

  // 라이브 모드로 돌아가기
  const handleBackToLiveMode = () => {
    setGameMode('live');
    onDismiss();
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
            titleStyle={{ color: '#ffffff' }}
            left={(props) => <IconButton {...props} icon="file-import" iconColor="#ffffff" />}
            right={(props) => <IconButton {...props} icon="close" iconColor="#ffffff" onPress={onDismiss} />}
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
            </View>

            <Divider style={styles.divider} />

            {/* PGN 텍스트 입력 */}
            <Text style={styles.label}>또는 PGN 텍스트 직접 입력:</Text>
            <TextInput
              mode="outlined"
              value={pgnText}
              onChangeText={setPgnText}
              placeholder="PGN 텍스트를 여기에 붙여넣으세요..."
              placeholderTextColor="#888888"
              multiline
              numberOfLines={8}
              style={styles.textInput}
              textColor="#e0e0e0"
              outlineColor="#777777"
              activeOutlineColor="#9C27B0"
              contentStyle={{ color: '#e0e0e0' }}
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
    color: '#e0e0e0',
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