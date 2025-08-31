import { ChessPuzzle } from '@/types';

export const openingPuzzles: ChessPuzzle[] = [
  // 유명한 오프닝 트랩들
  {
    id: 'opening_001',
    fen: 'rnbqkb1r/pppp1ppp/5n2/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq - 2 3',
    solution: ['Qf3'],
    theme: 'opening_trap',
    rating: 1000,
    title: '학자의 체크메이트 준비',
    description: '학자의 체크메이트 패턴을 준비하세요.',
    tags: ['beginner', 'scholars_mate', 'queen', 'bishop']
  },

  {
    id: 'opening_002',
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR b KQkq - 1 2',
    solution: ['Nf6'],
    theme: 'opening_trap',
    rating: 1100,
    title: '학자의 체크메이트 방어',
    description: '학자의 체크메이트를 방어하세요.',
    tags: ['beginner', 'defense', 'knight']
  },

  // 레가 트랩
  {
    id: 'opening_003',
    fen: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R b KQkq - 1 4',
    solution: ['f5'],
    theme: 'opening_trap',
    rating: 1300,
    title: '레가 트랩',
    description: 'f5로 백의 비숍을 공격하여 우위를 점하세요.',
    tags: ['intermediate', 'rega_trap', 'pawn_attack']
  },

  // 블랙버른 시링 게이밋
  {
    id: 'opening_004',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R b KQkq - 1 4',
    solution: ['Nd4'],
    theme: 'opening_trap',
    rating: 1400,
    title: '블랙버른 시링',
    description: '중앙을 차지하며 백의 비숍을 공격하세요.',
    tags: ['intermediate', 'blackburne_shilling', 'knight']
  },

  // 엥글런드 게이밧
  {
    id: 'opening_005',
    fen: 'rnbqkbnr/ppp1pppp/8/3p4/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2',
    solution: ['e5'],
    theme: 'opening_trap',
    rating: 1200,
    title: '엥글런드 게이밧',
    description: 'e5로 센터를 공격하세요.',
    tags: ['intermediate', 'england_gambit', 'pawn_sacrifice']
  },

  // 휠러 트랩
  {
    id: 'opening_006',
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1 b kq - 5 5',
    solution: ['d6', 'Bb5', 'Bd7'],
    theme: 'opening_trap',
    rating: 1500,
    title: '휠러 트랩',
    description: '비숍을 트랩에 빠뜨리세요.',
    tags: ['advanced', 'wheeler_trap', 'bishop_trap']
  },

  // 루이 로페즈 모르피 방어
  {
    id: 'opening_007',
    fen: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
    solution: ['a6', 'Ba4', 'b5'],
    theme: 'opening_trap',
    rating: 1350,
    title: '루이 로페즈 - 모르피 방어',
    description: 'a6과 b5로 비숍을 쫓아내세요.',
    tags: ['intermediate', 'ruy_lopez', 'morphy_defense']
  },

  // 이탈리안 게임 - 투 나이츠 디펜스
  {
    id: 'opening_008',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    solution: ['Ng5'],
    theme: 'opening_trap',
    rating: 1250,
    title: '투 나이츠 공격',
    description: 'Ng5로 f7 포인트를 공격하세요.',
    tags: ['intermediate', 'two_knights', 'attack']
  },

  // 프라이드 리버 어택
  {
    id: 'opening_009',
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 5',
    solution: ['Nxe4'],
    theme: 'opening_trap',
    rating: 1600,
    title: '프라이드 리버 디펜스',
    description: 'Nxe4로 반격하세요.',
    tags: ['advanced', 'fried_liver', 'counterattack']
  },

  // 케로 카운
  {
    id: 'opening_010',
    fen: 'rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
    solution: ['exd5'],
    theme: 'opening_trap',
    rating: 1150,
    title: '케로 카운 - 교환 변화',
    description: 'exd5로 센터 폰을 교환하세요.',
    tags: ['beginner', 'caro_kann', 'exchange']
  },

  // 시칠리안 디펜스 - 용 변화
  {
    id: 'opening_011',
    fen: 'rnbqkb1r/pp2pppp/3p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R b KQkq - 2 5',
    solution: ['g6'],
    theme: 'opening_trap',
    rating: 1450,
    title: '시칠리안 용 변화',
    description: 'g6으로 용 변화를 시작하세요.',
    tags: ['advanced', 'sicilian', 'dragon_variation']
  },

  // 킹스 인디안 디펜스
  {
    id: 'opening_012',
    fen: 'rnbqkb1r/pppppp1p/5np1/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3',
    solution: ['Nc3'],
    theme: 'opening_trap',
    rating: 1400,
    title: '킹스 인디안 셋업',
    description: 'Nc3으로 자연스럽게 개발하세요.',
    tags: ['intermediate', 'kings_indian', 'development']
  },

  // 퀸즈 게이밧 디클라인드
  {
    id: 'opening_013',
    fen: 'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2',
    solution: ['e6'],
    theme: 'opening_trap',
    rating: 1350,
    title: '퀸즈 게이밧 디클라인드',
    description: 'e6으로 게이밧을 거절하세요.',
    tags: ['intermediate', 'queens_gambit', 'declined']
  },

  // 알레킨 디펜스
  {
    id: 'opening_014',
    fen: 'rnbqkb1r/pppppppp/5n2/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 1 2',
    solution: ['e5'],
    theme: 'opening_trap',
    rating: 1300,
    title: '알레킨 디펜스에 대한 응답',
    description: 'e5로 나이트를 쫓아내세요.',
    tags: ['intermediate', 'alekhine_defense', 'pawn_advance']
  },

  // 스칸디나비안 디펜스
  {
    id: 'opening_015',
    fen: 'rnbqkbnr/ppp1pppp/8/3P4/8/8/PPPP1PPP/RNBQKBNR b KQkq - 0 2',
    solution: ['Qxd5'],
    theme: 'opening_trap',
    rating: 1200,
    title: '스칸디나비안 - 퀸 리캡처',
    description: 'Qxd5로 폰을 되잡으세요.',
    tags: ['beginner', 'scandinavian', 'queen_early']
  },

  // 피르츠 디펜스
  {
    id: 'opening_016',
    fen: 'rnbqkbnr/ppp1pppp/3p4/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
    solution: ['d4'],
    theme: 'opening_trap',
    rating: 1400,
    title: '피르츠 디펜스에 대한 응답',
    description: 'd4로 센터를 장악하세요.',
    tags: ['intermediate', 'pirc_defense', 'center_control']
  },

  // 모던 디펜스
  {
    id: 'opening_017',
    fen: 'rnbqkbnr/pppppp1p/6p1/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
    solution: ['d4'],
    theme: 'opening_trap',
    rating: 1450,
    title: '모던 디펜스 대응',
    description: 'd4로 공간 우위를 점하세요.',
    tags: ['advanced', 'modern_defense', 'space_advantage']
  },

  // 니므조-인디안 디펜스
  {
    id: 'opening_018',
    fen: 'rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4',
    solution: ['Qc2'],
    theme: 'opening_trap',
    rating: 1550,
    title: '니므조-인디안 메인 라인',
    description: 'Qc2로 비숍을 견제하세요.',
    tags: ['advanced', 'nimzo_indian', 'positional']
  },

  // 벤코 게이밧
  {
    id: 'opening_019',
    fen: 'rnbqkb1r/p1p1pppp/5n2/1p1p4/2PP4/5N2/PP2PPPP/RNBQKB1R b KQkq - 1 4',
    solution: ['b4'],
    theme: 'opening_trap',
    rating: 1600,
    title: '벤코 게이밧',
    description: 'b4로 퀸사이드에서 반격하세요.',
    tags: ['advanced', 'benko_gambit', 'queenside_play']
  },

  // 불가리안 어택
  {
    id: 'opening_020',
    fen: 'r1bqkb1r/pp2pppp/2np1n2/8/3NP3/2N1B3/PPP2PPP/R2QKB1R b KQkq - 4 6',
    solution: ['e6'],
    theme: 'opening_trap',
    rating: 1500,
    title: '불가리안 어택 방어',
    description: 'e6으로 센터를 강화하세요.',
    tags: ['advanced', 'bulgarian_attack', 'defense']
  }
];

// 오프닝 퍼즐 필터링 함수들
export const getOpeningBySystem = (system: string): ChessPuzzle[] => {
  return openingPuzzles.filter(puzzle => 
    puzzle.tags?.some(tag => tag.includes(system))
  );
};

export const getOpeningTraps = (): ChessPuzzle[] => {
  return openingPuzzles.filter(puzzle => puzzle.theme === 'opening_trap');
};

export const getBeginnerOpenings = (): ChessPuzzle[] => {
  return openingPuzzles.filter(puzzle => 
    puzzle.tags?.includes('beginner')
  );
};