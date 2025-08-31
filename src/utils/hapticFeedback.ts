import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * 햅틱 피드백 유틸리티
 */
export class HapticFeedback {
  private static isEnabled = true;

  static setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  static getEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * 가벼운 햅틱 피드백 (버튼 탭 등)
   */
  static async light() {
    if (!this.isEnabled || Platform.OS !== 'ios') return;
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.warn('Haptic feedback error:', error);
    }
  }

  /**
   * 중간 강도 햅틱 피드백 (기물 이동 등)
   */
  static async medium() {
    if (!this.isEnabled || Platform.OS !== 'ios') return;
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.warn('Haptic feedback error:', error);
    }
  }

  /**
   * 강한 햅틱 피드백 (오류, 중요한 액션 등)
   */
  static async heavy() {
    if (!this.isEnabled || Platform.OS !== 'ios') return;
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      console.warn('Haptic feedback error:', error);
    }
  }

  /**
   * 성공 피드백 (게임 승리, 퍼즐 완료 등)
   */
  static async success() {
    if (!this.isEnabled || Platform.OS !== 'ios') return;
    
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.warn('Haptic feedback error:', error);
    }
  }

  /**
   * 경고 피드백 (체크 상황 등)
   */
  static async warning() {
    if (!this.isEnabled || Platform.OS !== 'ios') return;
    
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      console.warn('Haptic feedback error:', error);
    }
  }

  /**
   * 오류 피드백 (무효한 이동, 게임 오버 등)
   */
  static async error() {
    if (!this.isEnabled || Platform.OS !== 'ios') return;
    
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      console.warn('Haptic feedback error:', error);
    }
  }

  /**
   * 선택 피드백 (기물 선택 등)
   */
  static async selection() {
    if (!this.isEnabled || Platform.OS !== 'ios') return;
    
    try {
      await Haptics.selectionAsync();
    } catch (error) {
      console.warn('Haptic feedback error:', error);
    }
  }
}

export default HapticFeedback;