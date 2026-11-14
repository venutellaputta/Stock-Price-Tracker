import axios from 'axios';
import { Stock, IndexQuote, Alert, NewsItem, MarketOverviewData, QuarterlyResult } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('stockpulse_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function cleanString(val: any, defaultVal: string = ''): string {
  if (!val) return defaultVal;
  return String(val)
    .trim()
    .replace(/^['"]+|['"]+$/g, '')
    .replace(/['"]/g, '');
}

export const authService = {
  register: async (name: string, email: string, password: string) => {
    const res = await api.post('/auth/register', { name, email, password });
    return res.data;
  },
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  updateProfile: async (name: string) => {
    const res = await api.put('/auth/profile', { name });
    return res.data;
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    const res = await api.put('/auth/change-password', { currentPassword, newPassword });
    return res.data;
  },
};

export const indexService = {
  getIndexDetails: async (symbol: string): Promise<{ success: boolean; index: IndexQuote; dataMode?: string; provider?: string; isLive?: boolean }> => {
    const cleanSym = cleanString(symbol);
    const res = await api.get(`/indices/${encodeURIComponent(cleanSym)}`);
    return res.data;
  },
  getIndexHistory: async (symbol: string, range: string = '1D') => {
    const cleanSym = cleanString(symbol);
    const cleanRange = cleanString(range, '1D').toUpperCase();
    const res = await api.get(`/indices/${encodeURIComponent(cleanSym)}/history?range=${cleanRange}`);
    return res.data;
  },
};

export const stockService = {
  search: async (query: string): Promise<{ success: boolean; stocks: Stock[] }> => {
    const cleanQ = cleanString(query);
    const res = await api.get(`/stocks/search?q=${encodeURIComponent(cleanQ)}`);
    return res.data;
  },
  getMarketOverview: async (): Promise<MarketOverviewData> => {
    const res = await api.get('/stocks/market-overview');
    return res.data;
  },
  getBySymbol: async (symbol: string): Promise<{ success: boolean; stock: Stock; quarterlyResults?: QuarterlyResult[]; dataMode?: string; provider?: string; isLive?: boolean }> => {
    const cleanSym = cleanString(symbol);
    const res = await api.get(`/stocks/${encodeURIComponent(cleanSym)}`);
    return res.data;
  },
  getHistory: async (symbol: string, range: string = '1Y') => {
    const cleanSym = cleanString(symbol);
    const cleanRange = cleanString(range, '1Y').toUpperCase();
    const res = await api.get(`/stocks/${encodeURIComponent(cleanSym)}/history?range=${cleanRange}`);
    return res.data;
  },
  getGainers: async () => {
    const res = await api.get('/stocks/gainers');
    return res.data;
  },
  getLosers: async () => {
    const res = await api.get('/stocks/losers');
    return res.data;
  },
  getSectors: async () => {
    const res = await api.get('/stocks/sectors');
    return res.data;
  },
};

export const watchlistService = {
  getWatchlist: async (): Promise<{ success: boolean; watchlist: Stock[] }> => {
    const res = await api.get('/watchlist');
    return res.data;
  },
  add: async (symbol: string) => {
    const cleanSym = cleanString(symbol);
    const res = await api.post('/watchlist', { symbol: cleanSym });
    return res.data;
  },
  remove: async (identifier: string) => {
    const cleanId = cleanString(identifier);
    const res = await api.delete(`/watchlist/${encodeURIComponent(cleanId)}`);
    return res.data;
  },
};

export const alertService = {
  getAlerts: async (): Promise<{ success: boolean; alerts: Alert[] }> => {
    const res = await api.get('/alerts');
    return res.data;
  },
  create: async (symbol: string, condition: 'ABOVE' | 'BELOW', targetPrice: number) => {
    const cleanSym = cleanString(symbol);
    const res = await api.post('/alerts', { symbol: cleanSym, condition, targetPrice });
    return res.data;
  },
  updateStatus: async (id: string, status: 'ACTIVE' | 'DISABLED') => {
    const res = await api.patch(`/alerts/${id}`, { status });
    return res.data;
  },
  triggerTestAlert: async (id: string) => {
    const res = await api.post(`/alerts/${id}/trigger-test`);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/alerts/${id}`);
    return res.data;
  },
};

export const compareService = {
  compare: async (symbols: string[]) => {
    const cleanSymbols = symbols.map((s) => cleanString(s)).filter(Boolean);
    const res = await api.get(`/compare?symbols=${cleanSymbols.join(',')}`);
    return res.data;
  },
};

export const newsService = {
  getNews: async (symbol?: string): Promise<{ success: boolean; news: NewsItem[] }> => {
    const cleanSym = symbol ? cleanString(symbol) : '';
    const url = cleanSym ? `/news?symbol=${encodeURIComponent(cleanSym)}` : '/news';
    const res = await api.get(url);
    return res.data;
  },
  getNewsBySymbol: async (symbol: string): Promise<{ success: boolean; news: NewsItem[] }> => {
    const cleanSym = cleanString(symbol);
    const res = await api.get(`/news/${encodeURIComponent(cleanSym)}`);
    return res.data;
  },
};

export default api;
