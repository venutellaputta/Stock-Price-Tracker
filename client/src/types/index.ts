export interface Stock {
  id: string;
  symbol: string;
  company_name: string;
  exchange: string;
  sector: string;
  cmp: number;
  change_val: number;
  change_percent: number;
  prev_close?: number;
  day_high?: number;
  day_low?: number;
  market_cap?: number;
  pe_ratio?: number;
  roce?: number;
  div_yield?: number;
  qtr_profit?: number;
  sales_var?: number;
  profit_var?: number;
  high_52?: number;
  low_52?: number;
  volume?: number;
  updated_at?: string;
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
}

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  watchlistCount?: number;
  activeAlertsCount?: number;
}

export interface Alert {
  id: string;
  user_id: string;
  stock_id: string;
  condition: 'ABOVE' | 'BELOW';
  target_price: number;
  status: 'ACTIVE' | 'TRIGGERED' | 'DISABLED';
  triggered_at?: string;
  created_at: string;
  stock?: Stock;
}

export interface NewsItem {
  id: string;
  stock_id?: string;
  symbol?: string;
  title: string;
  description: string;
  content?: string;
  source: string;
  url: string;
  published_at: string;
}

export interface MarketIndex {
  symbol?: string;
  name: string;
  value: number;
  change: number;
  percent: number;
  country: string;
}

export interface QuarterlyResult {
  quarter: string;
  sales: number;
  expenses: number;
  opmPercent: number;
  netProfit: number;
  eps: number;
}

export interface SectorSummary {
  sector: string;
  count: number;
  avg_change: number;
  top_stocks: Stock[];
}

export interface MarketOverviewData {
  marketStatus: 'OPEN' | 'CLOSED' | 'PRE_MARKET' | 'LIVE NSE/BSE';
  indices: MarketIndex[];
  allStocks: Stock[];
  gainers: Stock[];
  losers: Stock[];
  trending: Stock[];
  sectors: SectorSummary[];
  dataMode: 'live' | 'demo';
  provider: string;
  isLive: boolean;
}
