import { ChessPiece } from '@/types';

/**
 * Test utility to create mock captured pieces for testing the captured pieces display
 */
export const createTestCapturedPieces = () => {
  const testWhiteCaptured: ChessPiece[] = [
    { color: 'white', type: 'pawn' },
    { color: 'white', type: 'pawn' },
    { color: 'white', type: 'knight' },
    { color: 'white', type: 'bishop' },
    { color: 'white', type: 'queen' },
  ];

  const testBlackCaptured: ChessPiece[] = [
    { color: 'black', type: 'pawn' },
    { color: 'black', type: 'pawn' },
    { color: 'black', type: 'pawn' },
    { color: 'black', type: 'rook' },
    { color: 'black', type: 'knight' },
  ];

  return {
    white: testWhiteCaptured,
    black: testBlackCaptured,
  };
};

/**
 * Common opening moves that lead to captures for testing
 */
export const getTestGameWithCaptures = () => {
  // This would be a series of moves that lead to pieces being captured
  // For now, we can use the actual game state from GameContext
  return [];
};