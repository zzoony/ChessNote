import { ChessPuzzle } from '@/types';

export const endgamePuzzles: ChessPuzzle[] = [
  // 기본 체크메이트 패턴들
  {
    id: 'endgame_001',
    fen: '8/8/8/8/8/8/8/R3K2k w Q - 0 1',
    solution: ['Ra1#'],
    theme: 'back_rank_mate',
    rating: 1000,
    title: '룩 체크메이트',
    description: '룩으로 백랭크 체크메이트를 완성하세요.',
    tags: ['beginner', 'rook', 'checkmate', 'basic_endgame']
  },

  {
    id: 'endgame_002',
    fen: '8/8/8/8/8/8/6QK/6k1 w - - 0 1',
    solution: ['Qg1#'],
    theme: 'mating_attack',
    rating: 1050,
    title: '퀸 체크메이트',
    description: '퀸으로 간단한 체크메이트를 완성하세요.',
    tags: ['beginner', 'queen', 'checkmate', 'basic_endgame']
  },

  // 폰 엔드게임
  {
    id: 'endgame_003',
    fen: '8/8/8/8/8/3k4/3P4/3K4 w - - 0 1',
    solution: ['Kd2', 'Ke4', 'd4', 'Ke5', 'd5'],
    theme: 'promotion',
    rating: 1200,
    title: '폰 승급',
    description: '폰을 안전하게 승급시켜 승리하세요.',
    tags: ['intermediate', 'pawn', 'king', 'promotion']
  },

  {
    id: 'endgame_004',
    fen: '8/8/8/3k4/8/3PK3/8/8 w - - 0 1',
    solution: ['Kf4', 'Kd6', 'Kf5', 'Kd7', 'Kf6'],
    theme: 'promotion',
    rating: 1300,
    title: '오포지션',
    description: '오포지션을 활용하여 폰을 승급시키세요.',
    tags: ['intermediate', 'pawn', 'king', 'opposition']
  },

  // 룩 엔드게임
  {
    id: 'endgame_005',
    fen: '8/8/8/8/8/8/r7/K6k b - - 0 1',
    solution: ['Ra2', 'Kb1', 'Kg2'],
    theme: 'endgame',
    rating: 1400,
    title: '룩 vs 킹',
    description: '룩으로 적 킹을 체크메이트하세요.',
    tags: ['intermediate', 'rook', 'king', 'basic_endgame']
  },

  {
    id: 'endgame_006',
    fen: '1R6/8/8/8/8/8/r7/K6k w - - 0 1',
    solution: ['Rb1+', 'Rxb1', 'stalemate'],
    theme: 'endgame',
    rating: 1500,
    title: '스테일메이트 트랩',
    description: '주의! 스테일메이트 트랩을 피하세요.',
    tags: ['advanced', 'rook', 'stalemate']
  },

  // 퀸 엔드게임
  {
    id: 'endgame_007',
    fen: '8/8/8/8/8/8/8/Q3K2k w Q - 0 1',
    solution: ['Qa1+', 'Kg2', 'Qa2+', 'Kg1', 'Kf3'],
    theme: 'mating_attack',
    rating: 1350,
    title: '퀸으로 체크메이트',
    description: '퀸과 킹으로 적 킹을 체크메이트하세요.',
    tags: ['intermediate', 'queen', 'king', 'checkmate']
  },

  // 비숍 엔드게임
  {
    id: 'endgame_008',
    fen: '8/8/8/8/8/8/5B1K/6k1 w - - 0 1',
    solution: ['Bg3', 'Kf1', 'Kg1#'],
    theme: 'mating_attack',
    rating: 1250,
    title: '비숍과 킹',
    description: '비숍과 킹으로 코너에서 체크메이트하세요.',
    tags: ['intermediate', 'bishop', 'king', 'checkmate']
  },

  // 나이트 엔드게임
  {
    id: 'endgame_009',
    fen: '8/8/8/8/8/8/5N1K/6k1 w - - 0 1',
    solution: ['Ne4', 'Kf1', 'Nf2'],
    theme: 'endgame',
    rating: 1600,
    title: '나이트 엔드게임',
    description: '나이트로 적 킹의 움직임을 제한하세요.',
    tags: ['advanced', 'knight', 'king']
  },

  // 복합 엔드게임
  {
    id: 'endgame_010',
    fen: '8/8/8/8/5k2/8/5P1K/8 w - - 0 1',
    solution: ['f4+', 'Ke5', 'Kg3', 'Kf5', 'Kf3'],
    theme: 'promotion',
    rating: 1450,
    title: '킹과 폰 vs 킹',
    description: '킹의 지원으로 폰을 승급시키세요.',
    tags: ['advanced', 'pawn', 'king', 'endgame_theory']
  },

  // 실전 엔드게임 상황들
  {
    id: 'endgame_011',
    fen: '8/5k2/8/8/8/8/3R4/3K4 w - - 0 1',
    solution: ['Rd7+', 'Ke8', 'Kd2', 'Kf8', 'Kd3'],
    theme: 'endgame',
    rating: 1550,
    title: '룩 활용법',
    description: '룩으로 적 킹을 제압하고 전진하세요.',
    tags: ['advanced', 'rook', 'king', 'technique']
  },

  {
    id: 'endgame_012',
    fen: '8/8/3k4/8/3P4/3K4/8/8 w - - 0 1',
    solution: ['Kc4', 'Kc6', 'd5+', 'Kd6', 'Kb5'],
    theme: 'promotion',
    rating: 1400,
    title: '폰 돌파',
    description: '킹의 지원으로 폰을 전진시키세요.',
    tags: ['intermediate', 'pawn', 'king', 'breakthrough']
  },

  // 스테일메이트 패턴들
  {
    id: 'endgame_013',
    fen: '8/8/8/8/8/6k1/6P1/6K1 b - - 0 1',
    solution: [],
    theme: 'endgame',
    rating: 1300,
    title: '스테일메이트 인식',
    description: '이 포지션은 스테일메이트입니다.',
    tags: ['intermediate', 'stalemate', 'draw']
  },

  // 고급 엔드게임 기법
  {
    id: 'endgame_014',
    fen: '8/8/8/8/3k4/8/3P1K2/8 w - - 0 1',
    solution: ['Ke3', 'Ke5', 'd4+', 'Kd5', 'Kf4'],
    theme: 'promotion',
    rating: 1650,
    title: '삼각법',
    description: '삼각법을 사용하여 오포지션을 얻으세요.',
    tags: ['advanced', 'pawn', 'king', 'triangulation']
  },

  {
    id: 'endgame_015',
    fen: '8/8/2k5/8/2P5/2K5/8/8 w - - 0 1',
    solution: ['Kd4', 'Kd6', 'c5+', 'Kc6', 'Ke5'],
    theme: 'promotion',
    rating: 1700,
    title: '아웃플랭킹',
    description: '아웃플랭킹으로 적 킹을 우회하세요.',
    tags: ['advanced', 'pawn', 'king', 'outflanking']
  }
];

// 엔드게임 퍼즐 필터링 함수들
export const getEndgameByDifficulty = (difficulty: 'beginner' | 'intermediate' | 'advanced'): ChessPuzzle[] => {
  const ratingRanges = {
    beginner: [0, 1200],
    intermediate: [1200, 1500],
    advanced: [1500, 2000]
  };
  const [min, max] = ratingRanges[difficulty];
  return endgamePuzzles.filter(puzzle => puzzle.rating >= min && puzzle.rating <= max);
};

export const getEndgameByConcept = (concept: string): ChessPuzzle[] => {
  return endgamePuzzles.filter(puzzle => 
    puzzle.tags?.some(tag => tag.includes(concept))
  );
};

export const getBasicEndgames = (): ChessPuzzle[] => {
  return endgamePuzzles.filter(puzzle => 
    puzzle.tags?.includes('basic_endgame')
  );
};