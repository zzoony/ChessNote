// Stockfish WebAssembly 타입 정의

declare module 'stockfish' {
  interface StockfishWorker {
    postMessage(message: string): void;
    addMessageListener(callback: (message: string) => void): void;
    terminate(): void;
  }

  export default class Stockfish {
    constructor(): StockfishWorker;
  }
}