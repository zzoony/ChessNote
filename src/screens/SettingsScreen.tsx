import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  Alert,
  Dimensions,
} from 'react-native';
import { useTheme, ThemeName, BoardTheme, PieceStyle } from '../context/ThemeContext';
import { HapticFeedback } from '../utils/hapticFeedback';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import type { SettingsScreenProps } from '../types/navigation';

const { width } = Dimensions.get('window');

// 설정 섹션 컴포넌트
interface SettingSectionProps {
  title: string;
  children: React.ReactNode;
}

const SettingSection: React.FC<SettingSectionProps> = ({ title, children }) => {
  const { currentTheme } = useTheme();
  
  return (
    <View style={[styles.section, { backgroundColor: currentTheme.colors.card }]}>
      <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>{title}</Text>
      {children}
    </View>
  );
};

// 설정 항목 컴포넌트
interface SettingItemProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightComponent?: React.ReactNode;
  showArrow?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({ 
  title, 
  subtitle, 
  onPress, 
  rightComponent, 
  showArrow = false 
}) => {
  const { currentTheme } = useTheme();
  
  return (
    <TouchableOpacity
      style={[styles.settingItem, { borderBottomColor: currentTheme.colors.border }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingItemLeft}>
        <Text style={[styles.settingTitle, { color: currentTheme.colors.text }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: currentTheme.colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      <View style={styles.settingItemRight}>
        {rightComponent}
        {showArrow && (
          <Text style={[styles.arrow, { color: currentTheme.colors.textSecondary }]}>›</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

// 선택 옵션 컴포넌트
interface OptionSelectorProps<T> {
  title: string;
  options: { value: T; label: string; subtitle?: string }[];
  selectedValue: T;
  onSelect: (value: T) => void;
}

function OptionSelector<T extends string>({ 
  title, 
  options, 
  selectedValue, 
  onSelect 
}: OptionSelectorProps<T>) {
  const { currentTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedOption = options.find(option => option.value === selectedValue);
  
  const handleSelect = (value: T) => {
    HapticFeedback.light();
    onSelect(value);
    setIsOpen(false);
  };
  
  return (
    <View>
      <SettingItem
        title={title}
        subtitle={selectedOption?.label}
        onPress={() => setIsOpen(!isOpen)}
        showArrow
      />
      {isOpen && (
        <View style={[styles.optionsContainer, { backgroundColor: currentTheme.colors.surface }]}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionItem,
                { borderBottomColor: currentTheme.colors.border },
                selectedValue === option.value && { backgroundColor: currentTheme.colors.primary + '20' }
              ]}
              onPress={() => handleSelect(option.value)}
            >
              <Text style={[
                styles.optionLabel, 
                { color: currentTheme.colors.text },
                selectedValue === option.value && { color: currentTheme.colors.primary }
              ]}>
                {option.label}
              </Text>
              {option.subtitle && (
                <Text style={[styles.optionSubtitle, { color: currentTheme.colors.textSecondary }]}>
                  {option.subtitle}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { 
    currentTheme, 
    settings,
    isLoading,
    setTheme,
    setBoardTheme,
    setPieceStyle,
    setSoundEnabled,
    setAnimationsEnabled,
    setLanguage,
    setHapticFeedback,
    resetSettings,
  } = useTheme();

  // 테마 옵션
  const themeOptions: { value: ThemeName; label: string; subtitle: string }[] = [
    { value: 'classic', label: '클래식', subtitle: '전통적인 어두운 테마' },
    { value: 'light', label: '라이트', subtitle: '밝고 깔끔한 테마' },
    { value: 'dark', label: '다크', subtitle: '어두운 모던 테마' },
  ];

  // 보드 테마 옵션
  const boardThemeOptions: { value: BoardTheme; label: string; subtitle: string }[] = [
    { value: 'classic', label: '클래식', subtitle: '전통적인 나무 질감' },
    { value: 'modern', label: '모던', subtitle: '깔끔한 회색조' },
    { value: 'wooden', label: '우든', subtitle: '진한 나무 질감' },
    { value: 'marble', label: '마블', subtitle: '대리석 질감' },
  ];

  // 기물 스타일 옵션
  const pieceStyleOptions: { value: PieceStyle; label: string; subtitle: string }[] = [
    { value: 'classic', label: '클래식', subtitle: '전통적인 체스 기물' },
    { value: 'modern', label: '모던', subtitle: '심플한 현대적 기물' },
    { value: 'medieval', label: '메디발', subtitle: '중세풍 장식적 기물' },
  ];

  // 언어 옵션
  const languageOptions: { value: 'ko' | 'en'; label: string }[] = [
    { value: 'ko', label: '한국어' },
    { value: 'en', label: 'English' },
  ];

  // 설정 초기화 확인
  const handleResetSettings = () => {
    HapticFeedback.warning();
    Alert.alert(
      '설정 초기화',
      '모든 설정을 기본값으로 되돌리시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '초기화', 
          style: 'destructive',
          onPress: () => {
            HapticFeedback.heavy();
            resetSettings();
          }
        },
      ]
    );
  };

  // 로딩 중일 때 표시
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={[styles.loadingText, { color: currentTheme.colors.textSecondary }]}>
            설정을 불러오는 중...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      {/* 헤더 */}
      <View style={[styles.header, { backgroundColor: currentTheme.colors.surface }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            HapticFeedback.light();
            navigation.goBack();
          }}
        >
          <Text style={[styles.backButtonText, { color: currentTheme.colors.primary }]}>
            ← 뒤로
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: currentTheme.colors.text }]}>
          설정
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 디스플레이 설정 */}
        <SettingSection title="디스플레이">
          <OptionSelector
            title="앱 테마"
            options={themeOptions}
            selectedValue={settings.theme}
            onSelect={setTheme}
          />
          <OptionSelector
            title="체스보드 테마"
            options={boardThemeOptions}
            selectedValue={settings.boardTheme}
            onSelect={setBoardTheme}
          />
          <OptionSelector
            title="기물 스타일"
            options={pieceStyleOptions}
            selectedValue={settings.pieceStyle}
            onSelect={setPieceStyle}
          />
        </SettingSection>

        {/* 게임플레이 설정 */}
        <SettingSection title="게임플레이">
          <SettingItem
            title="애니메이션"
            subtitle="기물 이동 애니메이션 표시"
            rightComponent={
              <Switch
                value={settings.animationsEnabled}
                onValueChange={setAnimationsEnabled}
                trackColor={{ 
                  false: currentTheme.colors.border, 
                  true: currentTheme.colors.primary + '80' 
                }}
                thumbColor={settings.animationsEnabled ? currentTheme.colors.primary : currentTheme.colors.textSecondary}
              />
            }
          />
          <SettingItem
            title="소리 효과"
            subtitle="기물 이동 및 게임 이벤트 소리"
            rightComponent={
              <Switch
                value={settings.soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ 
                  false: currentTheme.colors.border, 
                  true: currentTheme.colors.primary + '80' 
                }}
                thumbColor={settings.soundEnabled ? currentTheme.colors.primary : currentTheme.colors.textSecondary}
              />
            }
          />
          <SettingItem
            title="햅틱 피드백"
            subtitle="터치 시 진동 피드백"
            rightComponent={
              <Switch
                value={settings.hapticFeedbackEnabled}
                onValueChange={setHapticFeedback}
                trackColor={{ 
                  false: currentTheme.colors.border, 
                  true: currentTheme.colors.primary + '80' 
                }}
                thumbColor={settings.hapticFeedbackEnabled ? currentTheme.colors.primary : currentTheme.colors.textSecondary}
              />
            }
          />
        </SettingSection>

        {/* 일반 설정 */}
        <SettingSection title="일반">
          <OptionSelector
            title="언어"
            options={languageOptions}
            selectedValue={settings.language}
            onSelect={setLanguage}
          />
        </SettingSection>

        {/* 기타 */}
        <SettingSection title="기타">
          <SettingItem
            title="설정 초기화"
            subtitle="모든 설정을 기본값으로 되돌리기"
            onPress={handleResetSettings}
            rightComponent={
              <Text style={[styles.dangerText, { color: currentTheme.colors.error }]}>
                초기화
              </Text>
            }
          />
        </SettingSection>

        {/* 앱 정보 */}
        <View style={[styles.appInfo, { backgroundColor: currentTheme.colors.card }]}>
          <Text style={[styles.appName, { color: currentTheme.colors.text }]}>
            ChessNote
          </Text>
          <Text style={[styles.appVersion, { color: currentTheme.colors.textSecondary }]}>
            버전 1.2.0
          </Text>
          <Text style={[styles.appDescription, { color: currentTheme.colors.textSecondary }]}>
            체스를 더 깊이 즐기는 방법
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerRight: {
    width: 50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  section: {
    marginTop: 24,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingItemLeft: {
    flex: 1,
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  arrow: {
    fontSize: 20,
    marginLeft: 8,
  },
  optionsContainer: {
    marginHorizontal: 16,
    marginTop: -1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  optionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  dangerText: {
    fontSize: 16,
    fontWeight: '500',
  },
  appInfo: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default SettingsScreen;