// Stockfish 엔진 테스트 스크립트
// 이 파일은 개발 중 엔진 동작을 확인하기 위한 테스트입니다.

import { getStockfishEngine } from '../stockfishEngine';
import { findBestMove, AI_PRESETS } from '../chessAI';
import { PieceColor, CastlingRights, BoardPosition } from '@/types';

// 기본 체스 시작 위치
const STARTING_POSITION: BoardPosition = {
  'a1': { type: 'rook', color: 'white' },
  'b1': { type: 'knight', color: 'white' },
  'c1': { type: 'bishop', color: 'white' },
  'd1': { type: 'queen', color: 'white' },
  'e1': { type: 'king', color: 'white' },
  'f1': { type: 'bishop', color: 'white' },
  'g1': { type: 'knight', color: 'white' },
  'h1': { type: 'rook', color: 'white' },
  'a2': { type: 'pawn', color: 'white' },
  'b2': { type: 'pawn', color: 'white' },
  'c2': { type: 'pawn', color: 'white' },
  'd2': { type: 'pawn', color: 'white' },
  'e2': { type: 'pawn', color: 'white' },
  'f2': { type: 'pawn', color: 'white' },
  'g2': { type: 'pawn', color: 'white' },
  'h2': { type: 'pawn', color: 'white' },
  'a7': { type: 'pawn', color: 'black' },
  'b7': { type: 'pawn', color: 'black' },
  'c7': { type: 'pawn', color: 'black' },
  'd7': { type: 'pawn', color: 'black' },
  'e7': { type: 'pawn', color: 'black' },
  'f7': { type: 'pawn', color: 'black' },
  'g7': { type: 'pawn', color: 'black' },
  'h7': { type: 'pawn', color: 'black' },
  'a8': { type: 'rook', color: 'black' },
  'b8': { type: 'knight', color: 'black' },
  'c8': { type: 'bishop', color: 'black' },
  'd8': { type: 'queen', color: 'black' },
  'e8': { type: 'king', color: 'black' },
  'f8': { type: 'bishop', color: 'black' },
  'g8': { type: 'knight', color: 'black' },
  'h8': { type: 'rook', color: 'black' },
};

const INITIAL_CASTLING: CastlingRights = {
  whiteKingSide: true,
  whiteQueenSide: true,
  blackKingSide: true,
  blackQueenSide: true,
};

// Stockfish 엔진 기본 테스트
export const testStockfishEngine = async () => {
  console.log('🔧 Stockfish 엔진 테스트 시작...');
  
  try {
    // 1. 엔진 초기화 테스트
    console.log('1️⃣ 엔진 초기화 중...');
    const engine = await getStockfishEngine();
    console.log(`✅ 엔진 초기화 완료: ${engine.isEngineReady()}`);
    
    // 2. 시작 위치에서 최선수 찾기
    console.log('2️⃣ 시작 위치 분석 중...');
    const bestMove = await findBestMove(
      STARTING_POSITION,
      'white',
      AI_PRESETS.intermediate,
      INITIAL_CASTLING,
      null,
      []
    );
    
    if (bestMove) {
      console.log(`✅ 최선수 발견: ${bestMove.from} → ${bestMove.to}`);
      console.log(`📊 평가: ${bestMove.evaluation}`);
      console.log(`🎯 점수: ${bestMove.score.toFixed(2)}`);
      console.log(`📈 깊이: ${bestMove.depth}`);
      console.log(`💪 신뢰도: ${(bestMove.confidence * 100).toFixed(1)}%`);
      console.log(`🔧 엔진: ${bestMove.engineName}`);
      
      if (bestMove.pv && bestMove.pv.length > 0) {
        console.log(`🔮 주요 변화수: ${bestMove.pv.slice(0, 5).join(' ')}`);
      }
    } else {
      console.error('❌ 최선수를 찾지 못했습니다');
    }
    
    // 3. 다양한 난이도 테스트
    console.log('3️⃣ 다양한 난이도 테스트...');
    const difficulties = ['beginner', 'intermediate', 'advanced', 'master'];
    
    for (const difficulty of difficulties) {
      console.log(`🎚️ ${difficulty} 모드 테스트 중...`);
      const move = await findBestMove(
        STARTING_POSITION,
        'white',
        AI_PRESETS[difficulty],
        INITIAL_CASTLING,
        null,
        []
      );
      
      if (move) {
        console.log(`  ✅ ${difficulty}: ${move.from}-${move.to} (점수: ${move.score.toFixed(2)})`);
      } else {
        console.log(`  ❌ ${difficulty}: 실패`);
      }
    }
    
    // 4. 성능 테스트
    console.log('4️⃣ 성능 테스트...');
    const startTime = Date.now();
    const quickMove = await findBestMove(
      STARTING_POSITION,
      'black',
      {
        ...AI_PRESETS.beginner,
        thinkingTime: 0.5,
      },
      INITIAL_CASTLING,
      null,
      ['e2e4'] // 화이트가 e4를 둔 상황
    );
    const endTime = Date.now();
    
    console.log(`⏱️ 빠른 분석 시간: ${endTime - startTime}ms`);
    if (quickMove) {
      console.log(`  ✅ 빠른 응답: ${quickMove.from}-${quickMove.to}`);
    }
    
    console.log('🎉 모든 테스트 완료!');
    return true;
    
  } catch (error) {
    console.error('💥 테스트 실패:', error);
    return false;
  }
};

// 특정 위치 분석 테스트
export const testSpecificPosition = async () => {
  console.log('🎯 특정 위치 분석 테스트...');
  
  // 유명한 체스 퍼즐: Scholar's Mate 위험 상황
  const testPosition: BoardPosition = {
    'a1': { type: 'rook', color: 'white' },
    'b1': { type: 'knight', color: 'white' },
    'c1': { type: 'bishop', color: 'white' },
    'd1': { type: 'queen', color: 'white' },
    'e1': { type: 'king', color: 'white' },
    'f1': { type: 'bishop', color: 'white' },
    'g1': { type: 'knight', color: 'white' },
    'h1': { type: 'rook', color: 'white' },
    'a2': { type: 'pawn', color: 'white' },
    'b2': { type: 'pawn', color: 'white' },
    'c2': { type: 'pawn', color: 'white' },
    'd2': { type: 'pawn', color: 'white' },
    'e4': { type: 'pawn', color: 'white' }, // e2-e4 moved
    'f2': { type: 'pawn', color: 'white' },
    'g2': { type: 'pawn', color: 'white' },
    'h2': { type: 'pawn', color: 'white' },
    'a7': { type: 'pawn', color: 'black' },
    'b7': { type: 'pawn', color: 'black' },
    'c7': { type: 'pawn', color: 'black' },
    'd7': { type: 'pawn', color: 'black' },
    'e5': { type: 'pawn', color: 'black' }, // e7-e5 moved
    'f7': { type: 'pawn', color: 'black' },
    'g7': { type: 'pawn', color: 'black' },
    'h7': { type: 'pawn', color: 'black' },
    'a8': { type: 'rook', color: 'black' },
    'b8': { type: 'knight', color: 'black' },
    'c8': { type: 'bishop', color: 'black' },
    'd8': { type: 'queen', color: 'black' },
    'e8': { type: 'king', color: 'black' },
    'f8': { type: 'bishop', color: 'black' },
    'g8': { type: 'knight', color: 'black' },
    'h8': { type: 'rook', color: 'black' },
    'c4': { type: 'bishop', color: 'white' }, // Bc1-c4 moved
  };
  
  try {
    const move = await findBestMove(
      testPosition,
      'white',
      AI_PRESETS.master,
      INITIAL_CASTLING,
      null,
      ['e2e4', 'e7e5', 'f1c4']
    );
    
    if (move) {
      console.log('📍 특정 위치 분석 결과:');
      console.log(`  최선수: ${move.from} → ${move.to}`);
      console.log(`  평가: ${move.evaluation}`);
      console.log(`  점수: ${move.score.toFixed(2)}`);
      
      // Qh5 (queen to h5)를 찾으면 Scholar's Mate 공격을 제대로 인식한 것
      if (move.from === 'd1' && move.to === 'h5') {
        console.log('  🎯 Scholar\'s Mate 공격 패턴을 정확히 인식!');
      }
    }
    
  } catch (error) {
    console.error('💥 특정 위치 분석 실패:', error);
  }
};

// 브라우저나 React Native에서 실행할 수 있는 테스트 함수
export const runStockfishTests = async (): Promise<boolean> => {
  console.log('🚀 Stockfish 엔진 통합 테스트 시작');
  console.log('=' * 50);
  
  const success1 = await testStockfishEngine();
  await testSpecificPosition();
  
  console.log('=' * 50);
  console.log(`📊 테스트 결과: ${success1 ? '✅ 성공' : '❌ 실패'}`);
  
  return success1;
};