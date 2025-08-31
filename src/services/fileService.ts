import * as FileSystem from 'expo-file-system';
import { PGNFile, ParsedPGNGame } from '@/types/pgn';
import { parsePGN } from '@/utils/pgn/pgnParser';

/**
 * 파일 시스템 관련 서비스
 */

export const FILE_DIRECTORY = FileSystem.documentDirectory + 'pgn_files/';

// PGN 파일 디렉토리 초기화
export const initializeFileDirectory = async (): Promise<void> => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(FILE_DIRECTORY);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(FILE_DIRECTORY, { intermediates: true });
    }
  } catch (error) {
    console.error('Failed to initialize file directory:', error);
    throw error;
  }
};

// PGN 파일 저장
export const savePGNFile = async (
  filename: string,
  content: string
): Promise<PGNFile> => {
  try {
    await initializeFileDirectory();
    
    const filePath = FILE_DIRECTORY + filename;
    await FileSystem.writeAsStringAsync(filePath, content);
    
    // 파일 정보 가져오기
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    
    // PGN 파싱
    const parseResult = parsePGN(content);
    
    const pgnFile: PGNFile = {
      id: generateFileId(filename),
      name: filename,
      content,
      games: parseResult.games,
      createdAt: new Date(),
      modifiedAt: fileInfo.exists && 'modificationTime' in fileInfo && fileInfo.modificationTime ? 
        new Date(fileInfo.modificationTime) : new Date(),
      size: (fileInfo.exists && 'size' in fileInfo && fileInfo.size) ? fileInfo.size : content.length
    };
    
    return pgnFile;
  } catch (error) {
    console.error('Failed to save PGN file:', error);
    throw error;
  }
};

// PGN 파일 읽기
export const loadPGNFile = async (filename: string): Promise<PGNFile | null> => {
  try {
    const filePath = FILE_DIRECTORY + filename;
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    
    if (!fileInfo.exists) {
      return null;
    }
    
    const content = await FileSystem.readAsStringAsync(filePath);
    const parseResult = parsePGN(content);
    
    return {
      id: generateFileId(filename),
      name: filename,
      content,
      games: parseResult.games,
      createdAt: 'modificationTime' in fileInfo && fileInfo.modificationTime ? 
        new Date(fileInfo.modificationTime) : new Date(),
      modifiedAt: 'modificationTime' in fileInfo && fileInfo.modificationTime ? 
        new Date(fileInfo.modificationTime) : new Date(),
      size: ('size' in fileInfo && fileInfo.size) ? fileInfo.size : content.length
    };
  } catch (error) {
    console.error('Failed to load PGN file:', error);
    return null;
  }
};

// 모든 PGN 파일 목록 조회
export const listPGNFiles = async (): Promise<PGNFile[]> => {
  try {
    await initializeFileDirectory();
    
    const files = await FileSystem.readDirectoryAsync(FILE_DIRECTORY);
    const pgnFiles: PGNFile[] = [];
    
    for (const filename of files) {
      if (filename.toLowerCase().endsWith('.pgn')) {
        const pgnFile = await loadPGNFile(filename);
        if (pgnFile) {
          pgnFiles.push(pgnFile);
        }
      }
    }
    
    // 수정 시간 역순으로 정렬 (최신 파일 먼저)
    return pgnFiles.sort((a, b) => b.modifiedAt.getTime() - a.modifiedAt.getTime());
  } catch (error) {
    console.error('Failed to list PGN files:', error);
    return [];
  }
};

// PGN 파일 삭제
export const deletePGNFile = async (filename: string): Promise<boolean> => {
  try {
    const filePath = FILE_DIRECTORY + filename;
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(filePath);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to delete PGN file:', error);
    return false;
  }
};

// 파일 이름 변경
export const renamePGNFile = async (
  oldFilename: string,
  newFilename: string
): Promise<boolean> => {
  try {
    const oldPath = FILE_DIRECTORY + oldFilename;
    const newPath = FILE_DIRECTORY + newFilename;
    
    const oldFileInfo = await FileSystem.getInfoAsync(oldPath);
    if (!oldFileInfo.exists) {
      return false;
    }
    
    const content = await FileSystem.readAsStringAsync(oldPath);
    await FileSystem.writeAsStringAsync(newPath, content);
    await FileSystem.deleteAsync(oldPath);
    
    return true;
  } catch (error) {
    console.error('Failed to rename PGN file:', error);
    return false;
  }
};

// 파일 크기 포맷팅
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 고유 파일 ID 생성
const generateFileId = (filename: string): string => {
  return `${filename}_${Date.now()}`;
};

// 유효한 파일 이름인지 확인
export const isValidFilename = (filename: string): boolean => {
  // 금지된 문자들
  const forbiddenChars = /[<>:"/\\|?*]/;
  
  // 기본 검증
  if (!filename || filename.trim().length === 0) {
    return false;
  }
  
  if (forbiddenChars.test(filename)) {
    return false;
  }
  
  // 너무 긴 파일명
  if (filename.length > 255) {
    return false;
  }
  
  // 예약된 이름들 (Windows 기준)
  const reservedNames = [
    'CON', 'PRN', 'AUX', 'NUL', 
    'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
    'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
  ];
  
  const nameWithoutExt = filename.toLowerCase().replace(/\.[^/.]+$/, '');
  if (reservedNames.includes(nameWithoutExt.toUpperCase())) {
    return false;
  }
  
  return true;
};

// .pgn 확장자 확인 및 추가
export const ensurePGNExtension = (filename: string): string => {
  if (!filename.toLowerCase().endsWith('.pgn')) {
    return filename + '.pgn';
  }
  return filename;
};

// 파일 내용 검색
export const searchInPGNFiles = async (query: string): Promise<PGNFile[]> => {
  try {
    const allFiles = await listPGNFiles();
    const searchResults: PGNFile[] = [];
    
    const lowercaseQuery = query.toLowerCase();
    
    for (const file of allFiles) {
      // 파일명에서 검색
      if (file.name.toLowerCase().includes(lowercaseQuery)) {
        searchResults.push(file);
        continue;
      }
      
      // 게임 헤더에서 검색
      let found = false;
      for (const game of file.games) {
        const headerText = Object.values(game.headers).join(' ').toLowerCase();
        if (headerText.includes(lowercaseQuery)) {
          searchResults.push(file);
          found = true;
          break;
        }
      }
      
      // 이동 목록에서 검색 (간단한 검색)
      if (!found) {
        for (const game of file.games) {
          const movesText = game.moves.join(' ').toLowerCase();
          if (movesText.includes(lowercaseQuery)) {
            searchResults.push(file);
            break;
          }
        }
      }
    }
    
    return searchResults;
  } catch (error) {
    console.error('Failed to search in PGN files:', error);
    return [];
  }
};