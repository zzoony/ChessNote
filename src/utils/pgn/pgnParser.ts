import { ParsedPGNGame, PGNHeaders, PGNParseResult, PGNParseError } from '@/types/pgn';

/**
 * PGN 파서 - Portable Game Notation 형식의 체스 게임을 파싱합니다
 */

// PGN 헤더 파싱
export const parseHeaders = (headerLines: string[]): PGNHeaders => {
  const headers: PGNHeaders = {};
  
  for (const line of headerLines) {
    const trimmedLine = line.trim();
    if (!trimmedLine.startsWith('[') || !trimmedLine.endsWith(']')) {
      continue;
    }
    
    // [Key "Value"] 형식에서 키와 값 추출
    const match = trimmedLine.match(/^\[(\w+)\s+"([^"]*)"\]$/);
    if (match) {
      const [, key, value] = match;
      headers[key] = value;
    }
  }
  
  return headers;
};

// 이동 텍스트에서 주석 및 변화수 제거
export const cleanMoveText = (moveText: string): string => {
  let cleaned = moveText;
  
  // 주석 제거 {...}
  cleaned = cleaned.replace(/\{[^}]*\}/g, '');
  
  // 변화수 제거 (...)
  let depth = 0;
  let result = '';
  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (char === '(') {
      depth++;
    } else if (char === ')') {
      depth--;
    } else if (depth === 0) {
      result += char;
    }
  }
  
  return result.trim();
};

// 이동 목록 파싱
export const parseMoves = (moveText: string): string[] => {
  const cleanText = cleanMoveText(moveText);
  
  // 수 번호 제거 및 이동만 추출
  const moves: string[] = [];
  const tokens = cleanText.split(/\s+/).filter(token => token.length > 0);
  
  for (const token of tokens) {
    // 수 번호는 건너뛰기 (예: "1.", "15...", "142.")
    if (/^\d+\.+$/.test(token)) {
      continue;
    }
    
    // 게임 결과는 건너뛰기
    if (['1-0', '0-1', '1/2-1/2', '*'].includes(token)) {
      continue;
    }
    
    // 유효한 이동인지 간단히 검증
    if (isValidMoveFormat(token)) {
      moves.push(token);
    }
  }
  
  return moves;
};

// 간단한 이동 형식 검증
const isValidMoveFormat = (move: string): boolean => {
  // 기본적인 체스 이동 패턴들
  const patterns = [
    /^[KQRBN]?[a-h]?[1-8]?x?[a-h][1-8]$/, // 일반 이동 (예: e4, Nf3, Bxf7)
    /^[KQRBN]?[a-h]?[1-8]?x?[a-h][1-8]=[QRBN]$/, // 프로모션 (예: e8=Q)
    /^O-O(-O)?$/, // 캐슬링
    /^[a-h]x[a-h][1-8]\s*e\.p\.$/, // 앙파상
  ];
  
  // 체크, 체크메이트 표시 제거
  const cleanMove = move.replace(/[+#!?]+$/, '');
  
  return patterns.some(pattern => pattern.test(cleanMove));
};

// 주석 추출
export const extractComments = (moveText: string): { [moveIndex: number]: string } => {
  const comments: { [moveIndex: number]: string } = {};
  const matches = moveText.match(/\{([^}]*)\}/g);
  
  if (matches) {
    // 간단하게 순서대로 매핑 (실제로는 더 복잡한 로직 필요)
    matches.forEach((match, index) => {
      const comment = match.replace(/[{}]/g, '').trim();
      if (comment) {
        comments[index] = comment;
      }
    });
  }
  
  return comments;
};

// 변화수 추출
export const extractVariations = (moveText: string): { [moveIndex: number]: string[] } => {
  const variations: { [moveIndex: number]: string[] } = {};
  
  // 변화수는 괄호로 둘러싸임 (...)
  const matches = moveText.match(/\([^)]+\)/g);
  
  if (matches) {
    matches.forEach((match, index) => {
      const variation = match.replace(/[()]/g, '').trim();
      const variationMoves = parseMoves(variation);
      if (variationMoves.length > 0) {
        variations[index] = variationMoves;
      }
    });
  }
  
  return variations;
};

// 게임 결과 추출
export const parseResult = (text: string): string => {
  const resultMatch = text.match(/(1-0|0-1|1\/2-1\/2|\*)/);
  return resultMatch ? resultMatch[1] : '*';
};

// 단일 PGN 게임 파싱
export const parseSinglePGN = (pgnText: string): ParsedPGNGame => {
  const lines = pgnText.split('\n');
  const headerLines: string[] = [];
  const moveLines: string[] = [];
  
  let inMoves = false;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (!trimmedLine) {
      if (headerLines.length > 0 && !inMoves) {
        inMoves = true;
      }
      continue;
    }
    
    if (trimmedLine.startsWith('[') && !inMoves) {
      headerLines.push(trimmedLine);
    } else {
      inMoves = true;
      moveLines.push(trimmedLine);
    }
  }
  
  const moveText = moveLines.join(' ');
  
  return {
    headers: parseHeaders(headerLines),
    moves: parseMoves(moveText),
    result: parseResult(moveText),
    comments: extractComments(moveText),
    variations: extractVariations(moveText),
    raw: pgnText.trim()
  };
};

// 전체 PGN 텍스트 파싱 (여러 게임 포함 가능)
export const parsePGN = (pgnText: string): PGNParseResult => {
  const errors: PGNParseError[] = [];
  const warnings: string[] = [];
  const games: ParsedPGNGame[] = [];
  
  try {
    // PGN은 빈 줄로 게임을 구분
    const gameTexts = pgnText.split(/\n\s*\n/).filter(text => text.trim());
    
    for (let i = 0; i < gameTexts.length; i++) {
      try {
        const game = parseSinglePGN(gameTexts[i]);
        
        // 기본 검증
        if (!game.headers.White || !game.headers.Black) {
          warnings.push(`Game ${i + 1}: Missing player names`);
        }
        
        if (game.moves.length === 0) {
          warnings.push(`Game ${i + 1}: No moves found`);
        }
        
        games.push(game);
      } catch (error) {
        errors.push({
          type: 'syntax',
          message: `Failed to parse game ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          line: i + 1
        });
      }
    }
    
    return {
      success: errors.length === 0,
      games,
      errors,
      warnings
    };
  } catch (error) {
    return {
      success: false,
      games: [],
      errors: [{
        type: 'syntax',
        message: error instanceof Error ? error.message : 'Failed to parse PGN',
      }],
      warnings: []
    };
  }
};

// PGN 형식으로 변환
export const formatPGN = (game: ParsedPGNGame): string => {
  let pgn = '';
  
  // 헤더 추가
  const headerOrder = ['Event', 'Site', 'Date', 'Round', 'White', 'Black', 'Result'];
  
  for (const key of headerOrder) {
    if (game.headers[key]) {
      pgn += `[${key} "${game.headers[key]}"]\n`;
    }
  }
  
  // 다른 헤더들 추가
  for (const [key, value] of Object.entries(game.headers)) {
    if (!headerOrder.includes(key) && value) {
      pgn += `[${key} "${value}"]\n`;
    }
  }
  
  pgn += '\n';
  
  // 이동 목록 추가
  for (let i = 0; i < game.moves.length; i += 2) {
    const moveNumber = Math.floor(i / 2) + 1;
    pgn += `${moveNumber}.`;
    
    if (game.moves[i]) {
      pgn += ` ${game.moves[i]}`;
    }
    
    if (game.moves[i + 1]) {
      pgn += ` ${game.moves[i + 1]}`;
    }
    
    if (i % 10 === 8) { // 줄바꿈 (가독성)
      pgn += '\n';
    } else {
      pgn += ' ';
    }
  }
  
  pgn += `${game.result}\n`;
  
  return pgn.trim();
};