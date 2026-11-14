import axios from 'axios';
import { MarketDataProvider, Quote, IndexQuote, ChartPoint, SymbolHealthReport } from './MarketDataProvider.js';
import { cleanParam } from '../../utils/cleanParam.js';

interface BackoffState {
  nextRetry: number;
  failCount: number;
  reason: string;
}

export class YahooFinanceIndianProvider implements MarketDataProvider {
  private symbolMap: Record<string, string> = {
    NIFTY50: '^NSEI',
    SENSEX: '^BSESN',
    NIFTYBANK: '^NSEBANK',
    NIFTYIT: '^CNXIT',
    NIFTYNEXT50: '^NSMIDCP',
    NIFTYMIDCAP100: '^NSEMDCP100',
    TATAMOTORS: 'TATAMOTORS.NS',
  };

  private backoffMap = new Map<string, BackoffState>();

  private getNSETicker(symbol: string): string {
    const s = cleanParam(symbol);
    if (this.symbolMap[s]) return this.symbolMap[s];
    if (s.endsWith('.NS') || s.endsWith('.BO')) return s;
    return `${s}.NS`;
  }

  private isSymbolInBackoff(cleanSym: string): boolean {
    const state = this.backoffMap.get(cleanSym);
    if (!state) return false;
    if (Date.now() < state.nextRetry) return true;
    // Backoff expired, try again
    this.backoffMap.delete(cleanSym);
    return false;
  }

  private registerFailure(cleanSym: string, reason: string): void {
    const existing = this.backoffMap.get(cleanSym);
    const failCount = (existing?.failCount || 0) + 1;
    let delayMs = 15 * 1000; // 15s for 1st fail
    if (failCount === 2) delayMs = 60 * 1000; // 1m for 2nd fail
    else if (failCount >= 3) delayMs = 10 * 60 * 1000; // 10m for 3rd+ fail

    this.backoffMap.set(cleanSym, {
      nextRetry: Date.now() + delayMs,
      failCount,
      reason,
    });

    if (failCount === 1 || failCount === 3) {
      console.warn(`⚠️ YahooFinance: Symbol '${cleanSym}' marked UNAVAILABLE (${reason}). Backing off for ${Math.round(delayMs / 1000)}s.`);
    }
  }

  async getQuote(symbol: string): Promise<Quote | null> {
    const cleanSym = cleanParam(symbol);
    if (this.isSymbolInBackoff(cleanSym)) {
      return null;
    }

    const ticker = this.getNSETicker(cleanSym);

    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1m&range=1d`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
        },
        timeout: 6000,
      });

      const result = response.data?.chart?.result?.[0];
      const errorObj = response.data?.chart?.error;

      if (errorObj) {
        this.registerFailure(cleanSym, errorObj.code || 'SYMBOL_NOT_FOUND');
        return null;
      }

      const meta = result?.meta;
      if (meta && meta.regularMarketPrice !== undefined) {
        const cmp = meta.regularMarketPrice;
        const prevClose = meta.chartPreviousClose || meta.previousClose || cmp;
        const changeVal = Number((cmp - prevClose).toFixed(2));
        const changePercent = Number(((changeVal / prevClose) * 100).toFixed(2));

        // Clear backoff on success
        this.backoffMap.delete(cleanSym);

        return {
          symbol: cleanSym,
          companyName: meta.shortName || meta.longName || cleanSym,
          exchange: ticker.endsWith('.BO') ? 'BSE' : 'NSE',
          cmp,
          changeVal,
          changePercent,
          prevClose,
          open: meta.regularMarketDayLow !== undefined ? Number(meta.regularMarketDayLow.toFixed(2)) : prevClose,
          dayHigh: meta.regularMarketDayHigh || cmp,
          dayLow: meta.regularMarketDayLow || cmp,
          high52: meta.fiftyTwoWeekHigh || Number((cmp * 1.15).toFixed(2)),
          low52: meta.fiftyTwoWeekLow || Number((cmp * 0.85).toFixed(2)),
          volume: meta.regularMarketVolume || meta.volume || 1000000,
          marketCap: meta.marketCap ? Number((meta.marketCap / 10000000).toFixed(2)) : undefined,
          lastUpdated: new Date().toISOString(),
          status: 'LIVE',
        };
      } else {
        this.registerFailure(cleanSym, 'INVALID_RESPONSE_STRUCTURE');
      }
    } catch (err: any) {
      const statusMsg = err.response?.status ? `HTTP ${err.response.status}` : err.message;
      this.registerFailure(cleanSym, statusMsg);
    }

    return null;
  }

  async getIndexQuote(symbol: string): Promise<IndexQuote | null> {
    const cleanSym = cleanParam(symbol);
    if (this.isSymbolInBackoff(cleanSym)) {
      return null;
    }

    const ticker = this.symbolMap[cleanSym] || '^NSEI';

    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1m&range=1d`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
        },
        timeout: 6000,
      });

      const result = response.data?.chart?.result?.[0];
      const meta = result?.meta;

      if (meta && meta.regularMarketPrice !== undefined) {
        const value = meta.regularMarketPrice;
        const prevClose = meta.chartPreviousClose || meta.previousClose || value;
        const changeVal = Number((value - prevClose).toFixed(2));
        const changePercent = Number(((changeVal / prevClose) * 100).toFixed(2));

        this.backoffMap.delete(cleanSym);

        return {
          symbol: cleanSym,
          name: meta.shortName || cleanSym,
          exchange: cleanSym === 'SENSEX' ? 'BSE' : 'NSE',
          value,
          changeVal,
          changePercent,
          prevClose,
          open: meta.regularMarketDayLow || value,
          dayHigh: meta.regularMarketDayHigh || value,
          dayLow: meta.regularMarketDayLow || value,
          high52: meta.fiftyTwoWeekHigh || Number((value * 1.15).toFixed(2)),
          low52: meta.fiftyTwoWeekLow || Number((value * 0.85).toFixed(2)),
          lastUpdated: new Date().toISOString(),
          status: 'LIVE',
        };
      } else {
        this.registerFailure(cleanSym, 'INVALID_INDEX_RESPONSE');
      }
    } catch (err: any) {
      const statusMsg = err.response?.status ? `HTTP ${err.response.status}` : err.message;
      this.registerFailure(cleanSym, statusMsg);
    }

    return null;
  }

  async getHistoricalData(symbol: string, range: string): Promise<ChartPoint[]> {
    const cleanSym = cleanParam(symbol);
    const cleanRange = cleanParam(range, '1D');
    const ticker = this.getNSETicker(cleanSym);

    let interval = '5m';
    let yahooRange = '1d';

    if (cleanRange === '1D') {
      interval = '5m';
      yahooRange = '1d';
    } else if (cleanRange === '1W') {
      interval = '15m';
      yahooRange = '5d';
    } else if (cleanRange === '1M') {
      interval = '1d';
      yahooRange = '1mo';
    } else if (cleanRange === '3M') {
      interval = '1d';
      yahooRange = '3mo';
    } else if (cleanRange === '6M') {
      interval = '1d';
      yahooRange = '6mo';
    } else if (cleanRange === '1Y') {
      interval = '1d';
      yahooRange = '1y';
    } else if (cleanRange === '5Y') {
      interval = '1wk';
      yahooRange = '5y';
    }

    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=${interval}&range=${yahooRange}`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
        },
        timeout: 7000,
      });

      const result = response.data?.chart?.result?.[0];
      const timestamps: number[] = result?.timestamp || [];
      const quoteObj = result?.indicators?.quote?.[0] || {};
      const opens = quoteObj.open || [];
      const highs = quoteObj.high || [];
      const lows = quoteObj.low || [];
      const closes = quoteObj.close || [];
      const volumes = quoteObj.volume || [];

      if (timestamps.length > 0 && closes.length > 0) {
        const points: ChartPoint[] = [];

        for (let i = 0; i < timestamps.length; i++) {
          const closePrice = closes[i];
          if (closePrice !== null && closePrice !== undefined && !isNaN(closePrice)) {
            const time = new Date(timestamps[i] * 1000);
            
            let label = time.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
            if (cleanRange === '1D') {
              label = time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
            }

            const openP = opens[i] !== null && opens[i] !== undefined ? Number(opens[i].toFixed(2)) : Number(closePrice.toFixed(2));
            const highP = highs[i] !== null && highs[i] !== undefined ? Number(highs[i].toFixed(2)) : Number(closePrice.toFixed(2));
            const lowP = lows[i] !== null && lows[i] !== undefined ? Number(lows[i].toFixed(2)) : Number(closePrice.toFixed(2));
            const closeP = Number(closePrice.toFixed(2));

            points.push({
              timestamp: time.toISOString(),
              label,
              open: openP,
              high: highP,
              low: lowP,
              close: closeP,
              price: closeP,
              volume: volumes[i] || 0,
            });
          }
        }

        if (points.length > 0) return points;
      }
    } catch (err: any) {
      console.warn(`YahooFinance live history warning for '${cleanSym}' range '${cleanRange}':`, err.message);
    }

    return [];
  }

  async getIndexHistoricalData(symbol: string, range: string): Promise<ChartPoint[]> {
    const cleanSym = cleanParam(symbol);
    const cleanRange = cleanParam(range, '1D');
    const ticker = this.symbolMap[cleanSym] || '^NSEI';

    let interval = '5m';
    let yahooRange = '1d';

    if (cleanRange === '1D') {
      interval = '5m';
      yahooRange = '1d';
    } else if (cleanRange === '1W') {
      interval = '15m';
      yahooRange = '5d';
    } else if (cleanRange === '1M') {
      interval = '1d';
      yahooRange = '1mo';
    } else if (cleanRange === '3M') {
      interval = '1d';
      yahooRange = '3mo';
    } else if (cleanRange === '6M') {
      interval = '1d';
      yahooRange = '6mo';
    } else if (cleanRange === '1Y') {
      interval = '1d';
      yahooRange = '1y';
    } else if (cleanRange === '5Y') {
      interval = '1wk';
      yahooRange = '5y';
    }

    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=${interval}&range=${yahooRange}`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
        },
        timeout: 7000,
      });

      const result = response.data?.chart?.result?.[0];
      const timestamps: number[] = result?.timestamp || [];
      const quoteObj = result?.indicators?.quote?.[0] || {};
      const opens = quoteObj.open || [];
      const highs = quoteObj.high || [];
      const lows = quoteObj.low || [];
      const closes = quoteObj.close || [];

      if (timestamps.length > 0 && closes.length > 0) {
        const points: ChartPoint[] = [];

        for (let i = 0; i < timestamps.length; i++) {
          const closePrice = closes[i];
          if (closePrice !== null && closePrice !== undefined && !isNaN(closePrice)) {
            const time = new Date(timestamps[i] * 1000);
            
            let label = time.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
            if (cleanRange === '1D') {
              label = time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
            }

            const openP = opens[i] !== null && opens[i] !== undefined ? Number(opens[i].toFixed(2)) : Number(closePrice.toFixed(2));
            const highP = highs[i] !== null && highs[i] !== undefined ? Number(highs[i].toFixed(2)) : Number(closePrice.toFixed(2));
            const lowP = lows[i] !== null && lows[i] !== undefined ? Number(lows[i].toFixed(2)) : Number(closePrice.toFixed(2));
            const closeP = Number(closePrice.toFixed(2));

            points.push({
              timestamp: time.toISOString(),
              label,
              open: openP,
              high: highP,
              low: lowP,
              close: closeP,
              price: closeP,
            });
          }
        }

        if (points.length > 0) return points;
      }
    } catch (err: any) {
      console.warn(`YahooFinance live index history warning for '${cleanSym}' range '${cleanRange}':`, err.message);
    }

    return [];
  }

  async getMarketMovers(): Promise<{ gainers: Quote[]; losers: Quote[]; trending: Quote[] }> {
    const symbols = ['TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'RELIANCE', 'SBIN', 'HCLTECH', 'WIPRO', 'LT'];
    const quotes: Quote[] = [];

    for (const sym of symbols) {
      try {
        const q = await this.getQuote(sym);
        if (q) quotes.push(q);
      } catch (e) {
        // Ignore individual quote errors for movers
      }
    }

    const gainers = [...quotes].sort((a, b) => b.changePercent - a.changePercent).slice(0, 6);
    const losers = [...quotes].sort((a, b) => a.changePercent - b.changePercent).slice(0, 6);
    const trending = [...quotes].sort((a, b) => b.volume - a.volume).slice(0, 6);

    return { gainers, losers, trending };
  }

  async getHealthStatus(): Promise<Record<string, SymbolHealthReport>> {
    const testSymbols = ['TCS', 'INFY', 'RELIANCE', 'HDFCBANK', 'SBIN', 'TATAMOTORS', 'MARUTI', 'ITC', 'ICICIBANK', 'HCLTECH'];
    const report: Record<string, SymbolHealthReport> = {};

    for (const sym of testSymbols) {
      const providerSymbol = this.getNSETicker(sym);
      try {
        const q = await this.getQuote(sym);
        if (q) {
          report[sym] = {
            symbol: sym,
            providerSymbol,
            available: true,
            price: q.cmp,
            status: 'LIVE',
            lastUpdated: q.lastUpdated,
          };
        } else {
          const backoffState = this.backoffMap.get(sym);
          report[sym] = {
            symbol: sym,
            providerSymbol,
            available: false,
            price: null,
            status: 'UNAVAILABLE',
            error: backoffState?.reason || 'SYMBOL_NOT_AVAILABLE',
          };
        }
      } catch (err: any) {
        report[sym] = {
          symbol: sym,
          providerSymbol,
          available: false,
          price: null,
          status: 'UNAVAILABLE',
          error: err.message || 'REQUEST_FAILED',
        };
      }
    }

    return report;
  }
}
