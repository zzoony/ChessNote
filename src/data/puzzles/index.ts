import { ChessPuzzle, PuzzleCategory, PuzzleTheme } from '@/types';
import { tacticsPuzzles } from './tactics';
import { endgamePuzzles } from './endgame';
import { openingPuzzles } from './opening';

// 모든 퍼즐 통합
export const allPuzzles: ChessPuzzle[] = [
  ...tacticsPuzzles,
  ...endgamePuzzles,
  ...openingPuzzles
];

// 퍼즐 카테고리 정의
export const puzzleCategories: PuzzleCategory[] = [
  {
    id: 'tactics',
    name: '전술 퍼즐',
    description: '포크, 핀, 스큐어 등 체스 전술을 배우세요',
    icon: '⚡',
    themes: ['fork', 'pin', 'skewer', 'discovery', 'sacrifice', 'mating_attack'],
    color: '#FF6B35',
    puzzleCount: tacticsPuzzles.length
  },
  {
    id: 'endgame',
    name: '엔드게임',
    description: '기본적인 엔드게임 패턴과 기법을 익히세요',
    icon: '👑',
    themes: ['endgame', 'promotion', 'back_rank_mate'],
    color: '#4ECDC4',
    puzzleCount: endgamePuzzles.length
  },
  {
    id: 'opening',
    name: '오프닝 트랩',
    description: '오프닝 단계의 함정과 기회를 놓치지 마세요',
    icon: '🎯',
    themes: ['opening_trap'],
    color: '#45B7D1',
    puzzleCount: openingPuzzles.length
  },
  {
    id: 'special_moves',
    name: '특수 이동',
    description: '캐슬링, 앙파상, 프로모션 등 특수 규칙을 활용하세요',
    icon: '✨',
    themes: ['castling', 'en_passant', 'promotion'],
    color: '#96CEB4',
    puzzleCount: allPuzzles.filter(p => 
      ['castling', 'en_passant', 'promotion'].includes(p.theme)
    ).length
  },
  {
    id: 'checkmate',
    name: '체크메이트 패턴',
    description: '다양한 체크메이트 패턴을 마스터하세요',
    icon: '🏁',
    themes: ['back_rank_mate', 'smothered_mate', 'mating_attack'],
    color: '#FFEAA7',
    puzzleCount: allPuzzles.filter(p => 
      ['back_rank_mate', 'smothered_mate', 'mating_attack'].includes(p.theme)
    ).length
  }
];

// 난이도별 퍼즐 분류
export const puzzlesByDifficulty = {
  beginner: allPuzzles.filter(p => p.rating < 1300),
  intermediate: allPuzzles.filter(p => p.rating >= 1300 && p.rating < 1600),
  advanced: allPuzzles.filter(p => p.rating >= 1600)
};

// 유틸리티 함수들
export const getPuzzleById = (id: string): ChessPuzzle | undefined => {
  return allPuzzles.find(puzzle => puzzle.id === id);
};

export const getPuzzlesByCategory = (categoryId: string): ChessPuzzle[] => {
  const category = puzzleCategories.find(c => c.id === categoryId);
  if (!category) return [];
  
  return allPuzzles.filter(puzzle => 
    category.themes.includes(puzzle.theme as PuzzleTheme)
  );
};

export const getPuzzlesByTheme = (theme: PuzzleTheme): ChessPuzzle[] => {
  return allPuzzles.filter(puzzle => puzzle.theme === theme);
};

export const getPuzzlesByRatingRange = (min: number, max: number): ChessPuzzle[] => {
  return allPuzzles.filter(puzzle => puzzle.rating >= min && puzzle.rating <= max);
};

export const getRandomPuzzle = (categoryId?: string): ChessPuzzle => {
  let puzzlePool = allPuzzles;
  
  if (categoryId) {
    puzzlePool = getPuzzlesByCategory(categoryId);
  }
  
  return puzzlePool[Math.floor(Math.random() * puzzlePool.length)];
};

export const getDailyPuzzle = (): ChessPuzzle => {
  // 날짜를 기반으로 고정된 퍼즐 선택
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const puzzleIndex = dayOfYear % allPuzzles.length;
  return allPuzzles[puzzleIndex];
};

export const searchPuzzles = (query: string): ChessPuzzle[] => {
  const lowerQuery = query.toLowerCase();
  return allPuzzles.filter(puzzle => 
    puzzle.title?.toLowerCase().includes(lowerQuery) ||
    puzzle.description.toLowerCase().includes(lowerQuery) ||
    puzzle.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

// 통계 함수들
export const getTotalPuzzleCount = (): number => allPuzzles.length;

export const getPuzzleCountByRating = (): Record<string, number> => {
  const ranges = {
    'beginner (< 1300)': 0,
    'intermediate (1300-1600)': 0,
    'advanced (> 1600)': 0
  };
  
  allPuzzles.forEach(puzzle => {
    if (puzzle.rating < 1300) ranges['beginner (< 1300)']++;
    else if (puzzle.rating < 1600) ranges['intermediate (1300-1600)']++;
    else ranges['advanced (> 1600)']++;
  });
  
  return ranges;
};

export const getPuzzleCountByTheme = (): Record<PuzzleTheme, number> => {
  const counts = {} as Record<PuzzleTheme, number>;
  
  allPuzzles.forEach(puzzle => {
    counts[puzzle.theme] = (counts[puzzle.theme] || 0) + 1;
  });
  
  return counts;
};

// 개발용 통계
export const getPuzzleStats = () => {
  return {
    total: getTotalPuzzleCount(),
    byRating: getPuzzleCountByRating(),
    byTheme: getPuzzleCountByTheme(),
    categories: puzzleCategories.map(cat => ({
      id: cat.id,
      name: cat.name,
      count: cat.puzzleCount
    }))
  };
};