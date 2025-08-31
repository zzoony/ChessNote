import { ChessPuzzle } from '@/types';

export const tacticsPuzzles: ChessPuzzle[] = [
  // 포크 퍼즐들
  {
    id: 'tactics_001',
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
    solution: ['Ne5', 'Qh4+'],
    theme: 'fork',
    rating: 1200,
    title: '나이트 포크',
    description: '나이트로 킹과 퀸을 동시에 공격하여 퀸을 획득하세요.',
    tags: ['beginner', 'knight']
  },
  {
    id: 'tactics_002',
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
    solution: ['Qh5', 'Nf6+'],
    theme: 'fork',
    rating: 1100,
    title: '퀸과 나이트 조합',
    description: '퀸과 나이트를 활용한 포크 전술입니다.',
    tags: ['beginner', 'queen', 'knight']
  },
  
  // 핀 퍼즐들
  {
    id: 'tactics_003',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 5',
    solution: ['Bg5'],
    theme: 'pin',
    rating: 1300,
    title: '비숍 핀',
    description: '비숍으로 나이트를 킹에게 고정시키세요.',
    tags: ['intermediate', 'bishop']
  },
  {
    id: 'tactics_004',
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1 b kq - 5 5',
    solution: ['Bg4'],
    theme: 'pin',
    rating: 1250,
    title: '나이트를 핀',
    description: '비숍으로 나이트를 퀸에게 고정시키세요.',
    tags: ['intermediate', 'bishop']
  },

  // 스큐어 퍼즐들
  {
    id: 'tactics_005',
    fen: 'r3k2r/ppp2ppp/2n1b3/3p4/3P4/2P1B3/PP3PPP/R3K2R w KQkq - 0 1',
    solution: ['Ra8+'],
    theme: 'skewer',
    rating: 1400,
    title: '룩 스큐어',
    description: '룩으로 킹을 체크하여 뒤의 룩을 획득하세요.',
    tags: ['intermediate', 'rook']
  },

  // 디스커버리 공격
  {
    id: 'tactics_006',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 5',
    solution: ['Nd4'],
    theme: 'discovery',
    rating: 1350,
    title: '발견된 공격',
    description: '나이트를 이동시켜 비숍의 공격선을 열어주세요.',
    tags: ['intermediate', 'knight', 'bishop']
  },

  // 희생 퍼즐들
  {
    id: 'tactics_007',
    fen: 'r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1 w - - 0 8',
    solution: ['Bxf7+', 'Kxf7', 'Ng5+'],
    theme: 'sacrifice',
    rating: 1500,
    title: '비숍 희생',
    description: '비숍을 희생하여 킹을 노출시키고 공격하세요.',
    tags: ['advanced', 'bishop', 'knight']
  },

  // 체크메이트 공격
  {
    id: 'tactics_008',
    fen: 'r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4',
    solution: [],
    theme: 'mating_attack',
    rating: 1000,
    title: '학자의 체크메이트',
    description: '백이 체크메이트를 완성했습니다. 이미 게임이 끝났어요!',
    tags: ['beginner', 'checkmate']
  },

  // 백랭크 메이트
  {
    id: 'tactics_009',
    fen: '6k1/5ppp/8/8/8/8/8/R6K w - - 0 1',
    solution: ['Ra8#'],
    theme: 'back_rank_mate',
    rating: 1200,
    title: '백랭크 메이트',
    description: '룩으로 백랭크 체크메이트를 완성하세요.',
    tags: ['intermediate', 'rook', 'checkmate']
  },

  // 질식 메이트
  {
    id: 'tactics_010',
    fen: 'r1bqkb1r/ppp2ppp/2np1n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 5',
    solution: ['Nf7', 'Kf8', 'Nh6#'],
    theme: 'smothered_mate',
    rating: 1800,
    title: '질식 메이트',
    description: '나이트로 질식 체크메이트를 완성하세요.',
    tags: ['advanced', 'knight', 'checkmate']
  },

  // 프로모션 전술
  {
    id: 'tactics_011',
    fen: '8/7P/8/8/8/8/p7/8 w - - 0 1',
    solution: ['h8=Q'],
    theme: 'promotion',
    rating: 900,
    title: '프로모션 승리',
    description: '폰을 퀸으로 승격시켜 승리하세요.',
    tags: ['beginner', 'pawn', 'promotion']
  },

  // 앙파상
  {
    id: 'tactics_012',
    fen: 'rnbqkbnr/ppp1p1pp/8/3pPp2/8/8/PPPP1PPP/RNBQKBNR w KQkq f6 0 3',
    solution: ['exf6'],
    theme: 'en_passant',
    rating: 1100,
    title: '앙파상 공격',
    description: '앙파상 규칙을 활용하여 폰을 잡으세요.',
    tags: ['intermediate', 'pawn', 'special_move']
  },

  // 고급 전술들
  {
    id: 'tactics_013',
    fen: 'r2qk2r/ppp2ppp/2npbn2/2b1p3/2B1P3/3P1N2/PPP1NPPP/R1BQ1RK1 w kq - 0 8',
    solution: ['Nd5', 'Nxd5', 'exd5', 'Ne7+'],
    theme: 'fork',
    rating: 1600,
    title: '복합 전술',
    description: '교환을 통해 나이트 포크를 만들어내세요.',
    tags: ['advanced', 'knight', 'exchange']
  },

  {
    id: 'tactics_014',
    fen: 'r1bq1rk1/ppp1bppp/2np1n2/4p3/2B1P3/3P1N2/PPP1NPPP/R1BQ1RK1 w - - 0 8',
    solution: ['Bxf7+', 'Kh8', 'Ng5'],
    theme: 'sacrifice',
    rating: 1650,
    title: '그리스 선물',
    description: '비숍을 희생하여 킹측을 공격하세요.',
    tags: ['advanced', 'bishop', 'knight', 'attack']
  },

  {
    id: 'tactics_015',
    fen: 'r2q1rk1/ppp2ppp/2np1n2/2b1p3/2B1P2P/3P1N2/PPP1NPP1/R1BQ1RK1 b - - 0 9',
    solution: ['Nxe4', 'dxe4', 'Bxf2+'],
    theme: 'sacrifice',
    rating: 1700,
    title: '카운터 희생',
    description: '나이트와 비숍을 희생하여 반격하세요.',
    tags: ['advanced', 'knight', 'bishop', 'counterattack']
  }
];

// 테마별 퍼즐 필터링 함수들
export const getPuzzlesByTheme = (theme: string): ChessPuzzle[] => {
  return tacticsPuzzles.filter(puzzle => puzzle.theme === theme);
};

export const getPuzzlesByRatingRange = (minRating: number, maxRating: number): ChessPuzzle[] => {
  return tacticsPuzzles.filter(puzzle => puzzle.rating >= minRating && puzzle.rating <= maxRating);
};

export const getRandomPuzzle = (): ChessPuzzle => {
  return tacticsPuzzles[Math.floor(Math.random() * tacticsPuzzles.length)];
};

export const getPuzzleById = (id: string): ChessPuzzle | undefined => {
  return tacticsPuzzles.find(puzzle => puzzle.id === id);
};