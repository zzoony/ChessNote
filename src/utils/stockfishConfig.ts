// Stockfish 엔진 설정 유틸리티

import { AIConfig } from './chessAI';
import { StockfishConfig } from './stockfishEngine';

// ELO 레이팅 기반 설정
export const ELO_SETTINGS = {
  800: { skill: 0, depth: 3, time: 0.5 },   // 초심자
  1000: { skill: 3, depth: 5, time: 1 },   // 초급자
  1200: { skill: 6, depth: 7, time: 1.5 }, // 하급자
  1400: { skill: 9, depth: 9, time: 2 },   // 중급자
  1600: { skill: 12, depth: 11, time: 2.5 }, // 상급자
  1800: { skill: 15, depth: 13, time: 3 },   // 고급자
  2000: { skill: 17, depth: 15, time: 4 },   // 전문가
  2200: { skill: 19, depth: 17, time: 5 },   // 마스터
  2400: { skill: 20, depth: 20, time: 10 },  // 그랜드마스터
} as const;

// 난이도를 ELO 레이팅으로 매핑
export const DIFFICULTY_TO_ELO: Record<string, number> = {
  beginner: 1000,
  intermediate: 1400,
  advanced: 1800,
  master: 2200,
};

// ELO 레이팅으로부터 Stockfish 설정 생성
export const getStockfishConfigFromELO = (elo: number): StockfishConfig => {
  // 가장 가까운 ELO 레벨 찾기
  const availableELOs = Object.keys(ELO_SETTINGS).map(Number).sort((a, b) => a - b);
  let targetELO = availableELOs[0];
  
  for (const availableELO of availableELOs) {
    if (availableELO <= elo) {
      targetELO = availableELO;
    } else {
      break;
    }
  }
  
  const settings = ELO_SETTINGS[targetELO as keyof typeof ELO_SETTINGS];
  
  return {
    depth: settings.depth,
    skill: settings.skill,
    time: settings.time,
    contempt: Math.max(0, Math.min(100, (elo - 1000) / 10)), // ELO 기반 무승부 경향
    hash: Math.min(256, Math.max(16, Math.floor(elo / 10))), // ELO 기반 해시 크기
    multiPV: 1,
  };
};

// AI 설정을 Stockfish 설정으로 변환
export const convertAIConfigToStockfish = (config: AIConfig): StockfishConfig => {
  if (config.skill !== undefined) {
    // 이미 Stockfish 설정이 포함된 경우
    return {
      depth: config.depth,
      skill: config.skill,
      time: config.thinkingTime,
      contempt: config.contempt || 10,
      hash: config.hash || 64,
      multiPV: 1,
    };
  } else {
    // 기존 난이도 기반 설정을 ELO로 변환
    const elo = DIFFICULTY_TO_ELO[config.difficulty] || 1400;
    return getStockfishConfigFromELO(elo);
  }
};

// ELO 레이팅을 설명 텍스트로 변환
export const getELORatingDescription = (elo: number): string => {
  if (elo < 800) return '입문자';
  if (elo < 1000) return '초심자';
  if (elo < 1200) return '초급자';
  if (elo < 1400) return '하급자';
  if (elo < 1600) return '중급자';
  if (elo < 1800) return '상급자';
  if (elo < 2000) return '고급자';
  if (elo < 2200) return '전문가';
  if (elo < 2400) return '마스터';
  return '그랜드마스터';
};

// Stockfish 분석 결과를 사용자 친화적 텍스트로 변환
export const formatStockfishEvaluation = (
  score: number,
  depth: number,
  mate?: number
): string => {
  if (mate !== undefined) {
    if (mate > 0) {
      return `체크메이트 ${mate}수 (깊이 ${depth})`;
    } else {
      return `체크메이트를 당할 위험 ${Math.abs(mate)}수 (깊이 ${depth})`;
    }
  }
  
  const absScore = Math.abs(score);
  let evaluation = '';
  
  if (absScore > 5) {
    evaluation = score > 0 ? '압도적 우세' : '압도적 열세';
  } else if (absScore > 3) {
    evaluation = score > 0 ? '큰 우세' : '큰 열세';
  } else if (absScore > 1.5) {
    evaluation = score > 0 ? '우세' : '열세';
  } else if (absScore > 0.5) {
    evaluation = score > 0 ? '약간 우세' : '약간 열세';
  } else {
    evaluation = '균등';
  }
  
  return `${evaluation} (${score > 0 ? '+' : ''}${score.toFixed(2)}, 깊이 ${depth})`;
};

// 최선 변화수(PV)를 읽기 쉬운 형태로 변환
export const formatPrincipalVariation = (pv: string[]): string => {
  if (!pv || pv.length === 0) return '';
  
  // UCI 표기법을 체스 표기법으로 변환 (간단한 버전)
  const formattedMoves = pv.slice(0, 10).map((move, index) => {
    const moveNumber = Math.floor(index / 2) + 1;
    if (index % 2 === 0) {
      return `${moveNumber}.${move}`;
    } else {
      return move;
    }
  });
  
  return formattedMoves.join(' ');
};

// 엔진 성능 지표 계산
export const calculateEnginePerformance = (
  nodes: number,
  time: number // milliseconds
): {
  nps: number; // nodes per second
  efficiency: string;
} => {
  const nps = time > 0 ? Math.round(nodes / (time / 1000)) : 0;
  
  let efficiency = '';
  if (nps > 1000000) {
    efficiency = '매우 빠름';
  } else if (nps > 500000) {
    efficiency = '빠름';
  } else if (nps > 100000) {
    efficiency = '보통';
  } else {
    efficiency = '느림';
  }
  
  return { nps, efficiency };
};

// Stockfish 엔진 상태 확인
export const getEngineStatus = (
  isReady: boolean,
  isThinking: boolean,
  currentEvaluation: any
): string => {
  if (!isReady) return '초기화 중...';
  if (isThinking) return '분석 중...';
  if (currentEvaluation) return '준비됨';
  return '대기 중';
};