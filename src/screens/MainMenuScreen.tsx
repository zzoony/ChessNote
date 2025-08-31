import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { GameMode, GameModeConfig } from '../types/modes';
import { useTheme } from '../context/ThemeContext';
import type { MainMenuScreenProps } from '../types/navigation';

const { width } = Dimensions.get('window');

const gameModes: GameModeConfig[] = [
  {
    id: 'notation',
    title: '기보 작성',
    subtitle: '체스 게임을 기록하고 PGN으로 저장',
    icon: '📝',
    color: '#4CAF50',
  },
  {
    id: 'ai',
    title: 'AI 대전',
    subtitle: 'Stockfish 엔진과 대결하기',
    icon: '🤖',
    color: '#2196F3',
  },
  {
    id: 'puzzle',
    title: '퍼즐 모드',
    subtitle: '체스 퍼즐을 풀며 실력 향상',
    icon: '🧩',
    color: '#FF9800',
  },
  {
    id: 'review',
    title: 'PGN 리뷰',
    subtitle: '기존 게임을 분석하고 학습',
    icon: '📖',
    color: '#9C27B0',
  },
];

const MainMenuScreen: React.FC<MainMenuScreenProps> = ({ navigation }) => {
  const { currentTheme } = useTheme();

  const handleModeSelect = (mode: GameMode) => {
    console.log(`Selected mode: ${mode}`);
    // React Navigation으로 화면 이동
    switch (mode) {
      case 'notation':
        navigation.navigate('NotationMode');
        break;
      case 'ai':
        navigation.navigate('AIMode');
        break;
      case 'puzzle':
        navigation.navigate('PuzzleMode');
        break;
      case 'review':
        navigation.navigate('ReviewMode');
        break;
      default:
        console.warn('Unknown mode:', mode);
    }
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: currentTheme.colors.border }]}>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={handleSettingsPress}
        >
          <Text style={[styles.settingsButtonText, { color: currentTheme.colors.primary }]}>⚙️</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: currentTheme.colors.text }]}>ChessNote</Text>
          <Text style={[styles.version, { color: currentTheme.colors.textSecondary }]}>v1.2.0</Text>
          <Text style={[styles.subtitle, { color: currentTheme.colors.textSecondary }]}>체스를 더 깊이 즐기는 방법</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.modesContainer}>
          {gameModes.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              style={[
                styles.modeCard, 
                { 
                  borderLeftColor: mode.color,
                  backgroundColor: currentTheme.colors.card
                }
              ]}
              onPress={() => handleModeSelect(mode.id)}
              activeOpacity={0.8}
            >
              <View style={styles.modeCardContent}>
                <Text style={styles.modeIcon}>{mode.icon}</Text>
                <View style={styles.modeTextContainer}>
                  <Text style={[styles.modeTitle, { color: currentTheme.colors.text }]}>{mode.title}</Text>
                  <Text style={[styles.modeSubtitle, { color: currentTheme.colors.textSecondary }]}>{mode.subtitle}</Text>
                </View>
                <Text style={[styles.modeArrow, { color: currentTheme.colors.textSecondary }]}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.infoSection, { backgroundColor: currentTheme.colors.card }]}>
          <Text style={[styles.infoTitle, { color: currentTheme.colors.text }]}>최근 업데이트</Text>
          <Text style={[styles.infoText, { color: currentTheme.colors.textSecondary }]}>
            • 테마 시스템 및 설정 화면 추가{'\n'}
            • AI 대전 모드 추가{'\n'}
            • 퍼즐 시스템 구현{'\n'}
            • PGN 리뷰 기능 추가{'\n'}
            • UI/UX 개선
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: currentTheme.colors.border }]}>
        <Text style={[styles.footerText, { color: currentTheme.colors.textSecondary }]}>체스로 논리적 사고력을 키우세요</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 8,
  },
  settingsButtonText: {
    fontSize: 24,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerSpacer: {
    width: 40, // settingsButton과 동일한 공간 확보
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  version: {
    fontSize: 14,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  modesContainer: {
    paddingHorizontal: 20,
  },
  modeCard: {
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modeCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  modeIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  modeTextContainer: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 5,
  },
  modeSubtitle: {
    fontSize: 14,
  },
  modeArrow: {
    fontSize: 30,
    marginLeft: 10,
  },
  infoSection: {
    marginTop: 30,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default MainMenuScreen;