import axios from 'axios';
import { MarketDataProvider, Quote, IndexQuote, ChartPoint } from './MarketDataProvider.js';
import { YahooFinanceIndianProvider } from './YahooFinanceIndianProvider.js';

export class KiteDataProvider implements MarketDataProvider {
  private apiKey = process.env.KITE_API_KEY;
  private accessToken = process.env.KITE_ACCESS_TOKEN;
  private fallback = new YahooFinanceIndianProvider();

  async getQuote(symbol: string): Promise<Quote | null> {
    if (!this.apiKey || !this.accessToken) {
      return this.fallback.getQuote(symbol);
    }
    try {
      const response = await axios.get(`https://api.kite.trade/quote?i=NSE:${symbol}`, {
        headers: { 'X-Kite-Version': '3', Authorization: `token ${this.apiKey}:${this.accessToken}` },
        timeout: 5000,
      });
      const data = response.data?.data?.[`NSE:${symbol}`];
      if (data) {
        return {
          symbol: symbol.toUpperCase(),
          companyName: symbol,
          exchange: 'NSE',
          cmp: data.last_price,
          changeVal: Number((data.last_price - data.ohlc.close).toFixed(2)),
          changePercent: Number((((data.last_price - data.ohlc.close) / data.ohlc.close) * 100).toFixed(2)),
          prevClose: data.ohlc.close,
          open: data.ohlc.open,
          dayHigh: data.ohlc.high,
          dayLow: data.ohlc.low,
          high52: data.ohlc.high * 1.15,
          low52: data.ohlc.low * 0.85,
          volume: data.volume,
          lastUpdated: new Date().toISOString(),
        };
      }
    } catch (err) {
      console.warn(`Kite API quote error for ${symbol}:`, (err as Error).message);
    }
    return this.fallback.getQuote(symbol);
  }

  async getIndexQuote(symbol: string): Promise<IndexQuote | null> {
    return this.fallback.getIndexQuote(symbol);
  }

  async getHistoricalData(symbol: string, range: string): Promise<ChartPoint[]> {
    return this.fallback.getHistoricalData(symbol, range);
  }

  async getIndexHistoricalData(symbol: string, range: string): Promise<ChartPoint[]> {
    return this.fallback.getIndexHistoricalData(symbol, range);
  }

  async getMarketMovers(): Promise<{ gainers: Quote[]; losers: Quote[]; trending: Quote[] }> {
    return this.fallback.getMarketMovers();
  }
}
