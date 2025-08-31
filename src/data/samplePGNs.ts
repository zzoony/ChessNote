/**
 * 테스트 및 데모용 샘플 PGN 게임 데이터
 */

export const FAMOUS_GAMES_PGN = `[Event "World Championship Match"]
[Site "New York, NY USA"]
[Date "1972.07.11"]
[Round "6"]
[White "Fischer, Robert J."]
[Black "Spassky, Boris V."]
[Result "1-0"]
[ECO "D59"]
[Opening "Queen's Gambit Declined: Tartakower Variation"]

1.c4 e6 2.Nf3 d5 3.d4 Nf6 4.Nc3 Be7 5.Bg5 O-O 6.e3 h6 7.Bh4 b6 8.cxd5 Nxd5 
9.Bxe7 Qxe7 10.Nxd5 exd5 11.Rc1 Be6 12.Qa4 c5 13.Qa3 Rc8 14.Bb5 a6 15.dxc5 bxc5 
16.O-O Ra7 17.Be2 Nd7 18.Nd4 Qf8 19.Nxe6 fxe6 20.e4 d4 21.f4 Qe7 22.e5 Rb8 
23.Bc4 Kh8 24.Qh3 Nf8 25.b3 a5 26.f5 exf5 27.Rxf5 Nh7 28.Rcf1 Qd8 29.Qg3 Re7 
30.h4 Rbb7 31.e6 Rbc7 32.Qe5 Qe8 33.a4 Qd8 34.R1f2 Qe8 35.R2f3 Qd8 36.Bd3 Qe8 
37.Qe4 Nf6 38.Rxf6 gxf6 39.Rxf6 Kg8 40.Bc4 Kh8 41.Qf4 1-0

[Event "Casual Game"]
[Site "Paris FRA"]
[Date "1858.??.??"]
[Round "?"]
[White "Morphy, Paul"]
[Black "Duke Karl / Count Isouard"]
[Result "1-0"]
[ECO "C41"]
[Opening "Philidor Defense"]

1.e4 e5 2.Nf3 d6 3.d4 Bg4 4.dxe5 Bxf3 5.Qxf3 dxe5 6.Bc4 Nf6 7.Qb3 Qe7 
8.Nc3 c6 9.Bg5 b5 10.Nxb5 cxb5 11.Bxb5+ Nbd7 12.O-O-O Rd8 13.Rxd7 Rxd7 
14.Rd1 Qe6 15.Bxd7+ Nxd7 16.Qb8+ Nxb8 17.Rd8# 1-0

[Event "World Championship Match"]
[Site "New York, NY USA"]
[Date "1997.05.11"]
[Round "6"]
[White "Deep Blue"]
[Black "Kasparov, Garry"]
[Result "1-0"]
[ECO "B17"]
[Opening "Caro-Kann Defense: Steinitz Variation"]

1.e4 c6 2.d4 d5 3.Nc3 dxe4 4.Nxe4 Nd7 5.Ng5 Ngf6 6.Bd3 e6 7.N1f3 h6 
8.Nxe6 Qe7 9.O-O fxe6 10.Bg6+ Kd8 11.Bf4 b5 12.a4 Bb7 13.Re1 Nd5 14.Bg3 Kc8 
15.axb5 cxb5 16.Qd3 Bc6 17.Bf5 exf5 18.Rxe7 Bxe7 19.c4 1-0`;

export const OPENING_EXAMPLES_PGN = `[Event "Opening Example"]
[Site "Study"]
[Date "2024.01.01"]
[Round "1"]
[White "Italian Game"]
[Black "Two Knights Defense"]
[Result "*"]
[ECO "C55"]

1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.d3 Be7 5.O-O O-O 6.Re1 d6 7.a4 *

[Event "Opening Example"]
[Site "Study"]
[Date "2024.01.01"]
[Round "2"]
[White "Queen's Gambit"]
[Black "Declined"]
[Result "*"]
[ECO "D06"]

1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Be7 5.e3 O-O 6.Nf3 Nbd7 7.Rc1 c6 8.Bd3 dxc4 9.Bxc4 *

[Event "Opening Example"]  
[Site "Study"]
[Date "2024.01.01"]
[Round "3"]
[White "Sicilian Defense"]
[Black "Najdorf Variation"]
[Result "*"]
[ECO "B90"]

1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6 6.Be3 e5 7.f3 *`;

export const ENDGAME_STUDIES_PGN = `[Event "Endgame Study"]
[Site "Study"]
[Date "2024.01.01"]
[Round "1"]
[White "Basic Checkmate"]
[Black "Queen vs King"]
[Result "1-0"]

1.Qd1+ Kh8 2.Qd8+ Kh7 3.Qg8+ Kh6 4.Qg6# 1-0

[Event "Endgame Study"]
[Site "Study"]
[Date "2024.01.01"]
[Round "2"]
[White "Rook Endgame"]
[Black "Lucena Position"]
[Result "1-0"]

1.Rf4+ Ke5 2.Rh4 Kf6 3.Rh8 Rc1 4.Rf8+ Ke7 5.Rf5 Re1+ 6.Kf7 Re2 7.Ra5 Rf2+ 8.Ke8 1-0`;

export const TACTICAL_PUZZLES_PGN = `[Event "Tactical Puzzle"]
[Site "Study"]
[Date "2024.01.01"]
[Round "1"]
[White "Fork Tactic"]
[Black "Knight Fork"]
[Result "1-0"]

1.e4 e5 2.Nf3 Nc6 3.Bc4 f5 4.d3 fxe4 5.dxe4 Nf6 6.Ng5 d5 7.exd5 Nd4 8.c3 b5 
9.Bb3 Nxb3 10.axb3 Bc5 11.Nf7 Qd7 12.Nxh8 Qg4 13.Qf3 Qxg2 14.Qxf6 gxf6 15.Nf7 1-0

[Event "Tactical Puzzle"]
[Site "Study"] 
[Date "2024.01.01"]
[Round "2"]
[White "Pin Tactic"]
[Black "Bishop Pin"]
[Result "1-0"]

1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Be7 6.Re1 b5 7.Bb3 d6 8.c3 O-O 
9.h3 Nb8 10.d4 Nbd7 11.Bg5 Bb7 12.Nbd2 Re8 13.Bc2 Bf8 14.a4 h6 15.Bh4 c5 16.axb5 1-0`;

// 샘플 PGN 선택을 위한 카테고리 정의
export const SAMPLE_CATEGORIES = {
  famous: {
    title: '유명한 게임',
    description: '체스 역사상 유명한 게임들',
    pgn: FAMOUS_GAMES_PGN
  },
  openings: {
    title: '오프닝 예제',
    description: '주요 오프닝 변화수들',
    pgn: OPENING_EXAMPLES_PGN
  },
  endgames: {
    title: '엔드게임 연구',
    description: '기본적인 엔드게임 패턴들',
    pgn: ENDGAME_STUDIES_PGN
  },
  tactics: {
    title: '전술 퍼즐',
    description: '체스 전술 연습 문제',
    pgn: TACTICAL_PUZZLES_PGN
  }
};

// 간단한 테스트 게임 (개발용)
export const SIMPLE_TEST_GAME = `[Event "Test Game"]
[Site "Development"]
[Date "2024.01.01"]
[Round "1"]
[White "Player1"]
[Black "Player2"]
[Result "1-0"]

1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Be7 6.Re1 b5 7.Bb3 d6 8.c3 O-O 9.h3 Nb8 10.d4 1-0`;

export default {
  FAMOUS_GAMES_PGN,
  OPENING_EXAMPLES_PGN,
  ENDGAME_STUDIES_PGN,
  TACTICAL_PUZZLES_PGN,
  SAMPLE_CATEGORIES,
  SIMPLE_TEST_GAME
};