import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Button } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@/context/NavigationContext';

const HomeScreen: React.FC = () => {
  const { navigateToWrite, navigateToAnalysis } = useNavigation();

  const handleWritePress = () => {
    navigateToWrite();
  };

  const handleAnalysisPress = () => {
    navigateToAnalysis();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* 앱 제목 */}
      <View style={styles.header}>
        <Text style={styles.title}>ChessNote</Text>
        <Text style={styles.version}>v1.2.0</Text>
        <Text style={styles.subtitle}>체스기보 작성 및 분석 앱</Text>
      </View>

      {/* 메인 메뉴 */}
      <View style={styles.menuContainer}>
        <Button
          mode="contained"
          onPress={handleWritePress}
          style={[styles.menuButton, styles.writeButton]}
          labelStyle={styles.buttonLabel}
          icon="chess-pawn"
        >
          기보 작성
        </Button>
        
        <Text style={styles.buttonDescription}>
          체스를 플레이하면서 실시간으로 기보를 작성합니다
        </Text>

        <Button
          mode="contained"
          onPress={handleAnalysisPress}
          style={[styles.menuButton, styles.analysisButton]}
          labelStyle={styles.buttonLabel}
          icon="file-search-outline"
        >
          기보 분석
        </Button>
        
        <Text style={styles.buttonDescription}>
          PGN 파일을 가져와서 게임을 분석합니다
        </Text>
      </View>

      {/* 하단 정보 */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          완전한 체스 규칙 지원 • 특수 이동 • PGN 호환
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#312e2b',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  version: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#b0b0b0',
    textAlign: 'center',
  },
  menuContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  menuButton: {
    marginVertical: 15,
    paddingVertical: 8,
    borderRadius: 12,
  },
  writeButton: {
    backgroundColor: '#4CAF50',
  },
  analysisButton: {
    backgroundColor: '#9C27B0',
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  buttonDescription: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
});

export default HomeScreen;