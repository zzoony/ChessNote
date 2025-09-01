import { ChessMove, ChessPiece } from '@/types';

// PGN 게임 트리 노드
export interface GameTreeNode {
  fen: string;
  move: ChessMove | null;
  san: string | null;
  children: GameTreeNode[];
  halfMoves: number;
  comment?: string;
}

// 파싱된 게임 정보
export interface ParsedGame {
  headers: { [key: string]: string };
  tree: GameTreeNode;
  totalMoves: number;
}

// 간단한 PGN 파싱 (기본 이동만 처리)
export const parsePGNString = (pgnText: string): ParsedGame | null => {
  try {
    // 헤더와 이동 부분 분리
    const lines = pgnText.split('\n');
    const headers: { [key: string]: string } = {};
    const moveLines: string[] = [];
    
    // 헤더 파싱
    for (const line of lines) {
      const headerMatch = line.match(/^\[(\w+)\s+"([^"]+)"\]$/);
      if (headerMatch) {
        headers[headerMatch[1]] = headerMatch[2];
      } else if (line.trim() && !line.startsWith('[')) {
        moveLines.push(line.trim());
      }
    }
    
    // 이동 텍스트 결합 및 정리
    const moveText = moveLines.join(' ').replace(/\s+/g, ' ').trim();
    
    // 결과 부분 제거
    const cleanMoveText = moveText.replace(/\s*(1-0|0-1|1\/2-1\/2|\*)\s*$/, '');
    
    // 이동 번호와 함께 이동들 추출
    const moveMatches = cleanMoveText.match(/\d+\.\s*([a-zA-Z0-9+#=\-O]+)(?:\s+([a-zA-Z0-9+#=\-O]+))?/g);
    
    if (!moveMatches) {
      throw new Error('유효한 이동을 찾을 수 없습니다');
    }
    
    const moves: ChessMove[] = [];
    let totalMoves = 0;
    
    // 각 이동 쌍 처리
    for (const moveMatch of moveMatches) {
      const parts = moveMatch.split(/\s+/);
      if (parts.length >= 2) {
        // 백색 이동
        const whiteMove = parts[1];
        moves.push(createMoveFromSAN(whiteMove, 'white', totalMoves));
        totalMoves++;
        
        // 흑색 이동 (있는 경우)
        if (parts.length >= 3) {
          const blackMove = parts[2];
          moves.push(createMoveFromSAN(blackMove, 'black', totalMoves));
          totalMoves++;
        }
      }
    }
    
    // 게임 트리 구성
    const rootNode: GameTreeNode = {
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // 시작 위치
      move: null,
      san: null,
      children: [],
      halfMoves: 0,
    };
    
    let currentNode = rootNode;
    
    for (let i = 0; i < moves.length; i++) {
      const newNode: GameTreeNode = {
        fen: '', // 실제 FEN은 나중에 계산
        move: moves[i],
        san: moves[i].san,
        children: [],
        halfMoves: i + 1,
      };
      
      currentNode.children.push(newNode);
      currentNode = newNode;
    }

    return {
      headers,
      tree: rootNode,
      totalMoves: moves.length,
    };

  } catch (error) {
    console.error('PGN 파싱 오류:', error);
    return null;
  }
};

// SAN에서 기본 ChessMove 객체 생성
const createMoveFromSAN = (san: string, color: 'white' | 'black', moveNumber: number): ChessMove => {
  return {
    from: '', // 실제 구현에서는 SAN에서 추출
    to: '',   // 실제 구현에서는 SAN에서 추출
    piece: { type: 'pawn', color }, // 임시
    san,
    fen: '',
    timestamp: new Date(),
    isCastle: san === 'O-O' || san === 'O-O-O',
    isEnPassant: false,
  };
};


// 게임 트리에서 특정 위치의 이동 가져오기
export const getMoveAtPosition = (tree: GameTreeNode, position: number[]): GameTreeNode | null => {
  let currentNode = tree;
  
  for (const index of position) {
    if (index >= currentNode.children.length) {
      return null;
    }
    currentNode = currentNode.children[index];
  }
  
  return currentNode;
};

// 게임 트리의 총 이동 수 계산
export const getTotalMoves = (tree: GameTreeNode): number => {
  let total = 0;
  
  const countMoves = (node: GameTreeNode) => {
    if (node.move) total++;
    node.children.forEach(child => countMoves(child));
  };
  
  countMoves(tree);
  return total;
};

// 게임 트리에서 이동 배열 추출
export const getMovesFromTree = (tree: GameTreeNode): ChessMove[] => {
  const moves: ChessMove[] = [];
  let currentNode = tree;
  
  while (currentNode.children.length > 0) {
    currentNode = currentNode.children[0]; // 메인라인
    if (currentNode.move) {
      moves.push(currentNode.move);
    }
  }
  
  return moves;
};