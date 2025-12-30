/**
 * Mock websocket hooks for Qetta
 */
export function useTickerStream(_params?: { symbols?: string[] }) {
  return {
    tickers: [],
    isConnected: false,
  };
}
