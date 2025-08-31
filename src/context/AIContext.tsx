import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AIConfig, AI_PRESETS } from '@/utils/chessAI';
import { PieceColor } from '@/types';

// AI 게임 설정
export interface AIGameSettings {
  aiColor: 'white' | 'black' | 'random';
  difficulty: keyof typeof AI_PRESETS;
  thinkingTime: number;
}

// AI 게임 통계
export interface AIGameStats {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  averageGameLength: number;
  favoriteOpening?: string;
  longestGame?: number;
  shortestGame?: number;
}

// AI 게임 히스토리
export interface AIGameRecord {
  id: string;
  date: string;
  playerColor: PieceColor;
  aiDifficulty: keyof typeof AI_PRESETS;
  result: '1-0' | '0-1' | '1/2-1/2' | '*';
  moves: string[];
  duration: number; // 게임 시간 (초)
  pgn: string;
}

// Context 타입
interface AIContextType {
  // 설정
  gameSettings: AIGameSettings;
  updateGameSettings: (settings: Partial<AIGameSettings>) => void;
  resetSettingsToDefault: () => void;
  
  // 통계
  stats: AIGameStats;
  refreshStats: () => Promise<void>;
  
  // 게임 기록
  gameHistory: AIGameRecord[];
  addGameRecord: (record: Omit<AIGameRecord, 'id'>) => Promise<void>;
  getGameRecord: (id: string) => AIGameRecord | null;
  deleteGameRecord: (id: string) => Promise<void>;
  clearAllHistory: () => Promise<void>;
  
  // 설정 저장/로드
  saveSettings: () => Promise<void>;
  loadSettings: () => Promise<void>;
  
  // 최적화된 AI 설정 가져오기
  getOptimizedAIConfig: () => AIConfig;
}

// 기본 설정
const DEFAULT_SETTINGS: AIGameSettings = {
  aiColor: 'black',
  difficulty: 'intermediate',
  thinkingTime: 2,
};

// 기본 통계
const DEFAULT_STATS: AIGameStats = {
  totalGames: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  winRate: 0,
  averageGameLength: 0,
};

// 저장소 키
const STORAGE_KEYS = {
  AI_SETTINGS: '@chessnote_ai_settings',
  AI_HISTORY: '@chessnote_ai_history',
  AI_STATS: '@chessnote_ai_stats',
};

// Context 생성
const AIContext = createContext<AIContextType | undefined>(undefined);

// Provider 컴포넌트
export const AIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameSettings, setGameSettings] = useState<AIGameSettings>(DEFAULT_SETTINGS);
  const [stats, setStats] = useState<AIGameStats>(DEFAULT_STATS);
  const [gameHistory, setGameHistory] = useState<AIGameRecord[]>([]);

  // 컴포넌트 마운트 시 설정 로드
  useEffect(() => {
    loadSettings();
    loadHistory();
    refreshStats();
  }, []);

  // 설정 업데이트
  const updateGameSettings = (newSettings: Partial<AIGameSettings>) => {
    const updatedSettings = { ...gameSettings, ...newSettings };
    setGameSettings(updatedSettings);
    saveSettings();
  };

  // 설정 초기화
  const resetSettingsToDefault = () => {
    setGameSettings(DEFAULT_SETTINGS);
    saveSettings();
  };

  // 최적화된 AI 설정 가져오기
  const getOptimizedAIConfig = (): AIConfig => {
    const baseConfig = AI_PRESETS[gameSettings.difficulty];
    
    // 사용자 설정에 따라 조정
    return {
      ...baseConfig,
      thinkingTime: gameSettings.thinkingTime,
    };
  };

  // 설정 저장
  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.AI_SETTINGS,
        JSON.stringify(gameSettings)
      );
    } catch (error) {
      console.error('Failed to save AI settings:', error);
    }
  };

  // 설정 로드
  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(STORAGE_KEYS.AI_SETTINGS);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setGameSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      }
    } catch (error) {
      console.error('Failed to load AI settings:', error);
    }
  };

  // 게임 기록 추가
  const addGameRecord = async (record: Omit<AIGameRecord, 'id'>) => {
    const newRecord: AIGameRecord = {
      ...record,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };

    const updatedHistory = [newRecord, ...gameHistory].slice(0, 100); // 최대 100개 기록만 유지
    setGameHistory(updatedHistory);

    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.AI_HISTORY,
        JSON.stringify(updatedHistory)
      );
      await refreshStats(); // 통계 업데이트
    } catch (error) {
      console.error('Failed to save game record:', error);
    }
  };

  // 게임 기록 가져오기
  const getGameRecord = (id: string): AIGameRecord | null => {
    return gameHistory.find(record => record.id === id) || null;
  };

  // 게임 기록 삭제
  const deleteGameRecord = async (id: string) => {
    const updatedHistory = gameHistory.filter(record => record.id !== id);
    setGameHistory(updatedHistory);

    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.AI_HISTORY,
        JSON.stringify(updatedHistory)
      );
      await refreshStats(); // 통계 업데이트
    } catch (error) {
      console.error('Failed to delete game record:', error);
    }
  };

  // 모든 기록 삭제
  const clearAllHistory = async () => {
    setGameHistory([]);
    setStats(DEFAULT_STATS);

    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AI_HISTORY,
        STORAGE_KEYS.AI_STATS,
      ]);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  };

  // 히스토리 로드
  const loadHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem(STORAGE_KEYS.AI_HISTORY);
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        setGameHistory(parsedHistory);
      }
    } catch (error) {
      console.error('Failed to load game history:', error);
    }
  };

  // 통계 새로고침
  const refreshStats = async () => {
    try {
      // 히스토리에서 통계 계산
      const totalGames = gameHistory.length;
      if (totalGames === 0) {
        setStats(DEFAULT_STATS);
        return;
      }

      let wins = 0;
      let losses = 0;
      let draws = 0;
      let totalMoves = 0;
      const gameLengths: number[] = [];
      const openings: { [key: string]: number } = {};

      gameHistory.forEach(game => {
        // 승부 계산 (플레이어 관점)
        if (game.result === '1-0') {
          if (game.playerColor === 'white') wins++;
          else losses++;
        } else if (game.result === '0-1') {
          if (game.playerColor === 'black') wins++;
          else losses++;
        } else if (game.result === '1/2-1/2') {
          draws++;
        }

        // 게임 길이
        gameLengths.push(game.moves.length);
        totalMoves += game.moves.length;

        // 오프닝 분석 (첫 3수)
        if (game.moves.length >= 6) {
          const opening = game.moves.slice(0, 6).join(' ');
          openings[opening] = (openings[opening] || 0) + 1;
        }
      });

      // 가장 많이 사용한 오프닝
      const favoriteOpening = Object.entries(openings)
        .sort(([,a], [,b]) => b - a)[0]?.[0];

      const newStats: AIGameStats = {
        totalGames,
        wins,
        losses,
        draws,
        winRate: totalGames > 0 ? (wins / totalGames) * 100 : 0,
        averageGameLength: totalGames > 0 ? Math.round(totalMoves / totalGames) : 0,
        favoriteOpening,
        longestGame: gameLengths.length > 0 ? Math.max(...gameLengths) : undefined,
        shortestGame: gameLengths.length > 0 ? Math.min(...gameLengths) : undefined,
      };

      setStats(newStats);

      // 통계 저장
      await AsyncStorage.setItem(
        STORAGE_KEYS.AI_STATS,
        JSON.stringify(newStats)
      );
    } catch (error) {
      console.error('Failed to refresh stats:', error);
    }
  };

  const value: AIContextType = {
    gameSettings,
    updateGameSettings,
    resetSettingsToDefault,
    stats,
    refreshStats,
    gameHistory,
    addGameRecord,
    getGameRecord,
    deleteGameRecord,
    clearAllHistory,
    saveSettings,
    loadSettings,
    getOptimizedAIConfig,
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};

// Hook
export const useAI = (): AIContextType => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};