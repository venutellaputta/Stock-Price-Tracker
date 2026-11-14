export interface Quote {
  symbol: string;
  companyName: string;
  exchange: string;
  cmp: number;
  changeVal: number;
  changePercent: number;
  prevClose: number;
  open: number;
  dayHigh: number;
  dayLow: number;
  high52: number;
  low52: number;
  volume: number;
  marketCap?: number;
  peRatio?: number;
  roce?: number;
  divYield?: number;
  lastUpdated: string;
  status?: 'LIVE' | 'STALE' | 'UNAVAILABLE';
}

export interface IndexQuote {
  symbol: string;
  name: string;
  exchange: string;
  value: number;
  changeVal: number;
  changePercent: number;
  prevClose: number;
  open: number;
  dayHigh: number;
  dayLow: number;
  high52: number;
  low52: number;
  lastUpdated: string;
  status?: 'LIVE' | 'STALE' | 'UNAVAILABLE';
}

export interface ChartPoint {
  timestamp: string;
  label: string;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  price: number;
  volume?: number;
}

export interface SymbolHealthReport {
  symbol: string;
  providerSymbol: string;
  available: boolean;
  price: number | null;
  status: 'LIVE' | 'STALE' | 'UNAVAILABLE';
  lastUpdated?: string;
  error?: string;
}

export interface MarketDataProvider {
  getQuote(symbol: string): Promise<Quote | null>;
  getIndexQuote(symbol: string): Promise<IndexQuote | null>;
  getHistoricalData(symbol: string, range: string): Promise<ChartPoint[]>;
  getIndexHistoricalData(symbol: string, range: string): Promise<ChartPoint[]>;
  getMarketMovers(): Promise<{ gainers: Quote[]; losers: Quote[]; trending: Quote[] }>;
  getHealthStatus?(): Promise<Record<string, SymbolHealthReport>>;
  subscribeToLivePrices?(symbols: string[], callback: (quotes: Quote[]) => void): void;
}
