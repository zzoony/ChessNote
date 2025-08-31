import * as Clipboard from 'expo-clipboard';
import { parsePGN } from '@/utils/pgn/pgnParser';
import { PGNParseResult } from '@/types/pgn';

/**
 * 클립보드 관련 서비스
 */

// 클립보드에서 텍스트 읽기
export const getClipboardText = async (): Promise<string> => {
  try {
    const text = await Clipboard.getStringAsync();
    return text || '';
  } catch (error) {
    console.error('Failed to get clipboard text:', error);
    return '';
  }
};

// 클립보드에 텍스트 복사
export const setClipboardText = async (text: string): Promise<boolean> => {
  try {
    await Clipboard.setStringAsync(text);
    return true;
  } catch (error) {
    console.error('Failed to set clipboard text:', error);
    return false;
  }
};

// 클립보드에서 PGN 가져오기
export const importPGNFromClipboard = async (): Promise<{
  success: boolean;
  result?: PGNParseResult;
  error?: string;
}> => {
  try {
    const clipboardText = await getClipboardText();
    
    if (!clipboardText.trim()) {
      return {
        success: false,
        error: '클립보드가 비어있습니다.'
      };
    }
    
    // PGN 형식인지 간단히 확인
    if (!isPotentialPGN(clipboardText)) {
      return {
        success: false,
        error: '클립보드에 유효한 PGN 형식이 없습니다.'
      };
    }
    
    const parseResult = parsePGN(clipboardText);
    
    return {
      success: parseResult.success,
      result: parseResult,
      error: parseResult.success ? undefined : parseResult.errors[0]?.message
    };
  } catch (error) {
    return {
      success: false,
      error: `클립보드 가져오기 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    };
  }
};

// PGN을 클립보드에 복사
export const exportPGNToClipboard = async (pgnText: string): Promise<boolean> => {
  try {
    await setClipboardText(pgnText);
    return true;
  } catch (error) {
    console.error('Failed to export PGN to clipboard:', error);
    return false;
  }
};

// 텍스트가 PGN일 가능성이 있는지 확인
const isPotentialPGN = (text: string): boolean => {
  // 기본적인 PGN 패턴 확인
  const pgnPatterns = [
    /\[Event\s+"[^"]*"\]/, // Event 헤더
    /\[White\s+"[^"]*"\]/, // White 헤더
    /\[Black\s+"[^"]*"\]/, // Black 헤더
    /\d+\.\s*[a-zA-Z0-9+#-]+/, // 이동 표기 (예: 1. e4)
    /(1-0|0-1|1\/2-1\/2|\*)/ // 게임 결과
  ];
  
  // 하나 이상의 패턴이 매치되면 PGN일 가능성이 있음
  return pgnPatterns.some(pattern => pattern.test(text));
};

// 클립보드 내용이 변경되었는지 확인하는 유틸리티
export const hasClipboardChanged = (() => {
  let lastClipboardContent = '';
  
  return async (): Promise<boolean> => {
    const currentContent = await getClipboardText();
    const hasChanged = currentContent !== lastClipboardContent;
    lastClipboardContent = currentContent;
    return hasChanged;
  };
})();

// 클립보드에서 게임 정보만 추출 (헤더 정보)
export const extractGameInfoFromClipboard = async (): Promise<{
  white?: string;
  black?: string;
  event?: string;
  date?: string;
  result?: string;
} | null> => {
  try {
    const clipboardText = await getClipboardText();
    
    if (!clipboardText.trim()) {
      return null;
    }
    
    const gameInfo: any = {};
    
    // 헤더 정보 추출
    const headerMatches = clipboardText.match(/\[(\w+)\s+"([^"]*)"\]/g);
    
    if (headerMatches) {
      for (const match of headerMatches) {
        const headerMatch = match.match(/\[(\w+)\s+"([^"]*)"\]/);
        if (headerMatch) {
          const [, key, value] = headerMatch;
          gameInfo[key.toLowerCase()] = value;
        }
      }
    }
    
    return Object.keys(gameInfo).length > 0 ? gameInfo : null;
  } catch (error) {
    console.error('Failed to extract game info from clipboard:', error);
    return null;
  }
};

// 클립보드 모니터링 (개발 시 디버깅용)
export const monitorClipboard = (callback: (text: string) => void, interval: number = 1000) => {
  let lastContent = '';
  
  const checkClipboard = async () => {
    try {
      const currentContent = await getClipboardText();
      if (currentContent !== lastContent) {
        lastContent = currentContent;
        callback(currentContent);
      }
    } catch (error) {
      console.error('Error monitoring clipboard:', error);
    }
  };
  
  const intervalId = setInterval(checkClipboard, interval);
  
  // 정리 함수 반환
  return () => {
    clearInterval(intervalId);
  };
};

// 사용자에게 클립보드 권한이 있는지 확인
export const checkClipboardPermissions = async (): Promise<boolean> => {
  try {
    // 간단한 읽기 테스트
    await getClipboardText();
    return true;
  } catch (error) {
    console.warn('Clipboard permissions not available:', error);
    return false;
  }
};