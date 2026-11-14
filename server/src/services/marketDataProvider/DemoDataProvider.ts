import { MarketDataProvider, Quote, IndexQuote, ChartPoint } from './MarketDataProvider.js';
import { StockModel } from '../../models/stockModel.js';
import { cleanParam } from '../../utils/cleanParam.js';

export class DemoDataProvider implements MarketDataProvider {
  static indexMap: Record<string, IndexQuote> = {
    NIFTY50: { symbol: 'NIFTY50', name: 'NIFTY 50', exchange: 'NSE', value: 24580.45, changeVal: 125.60, changePercent: 0.51, prevClose: 24454.85, open: 24480.00, dayHigh: 24610.20, dayLow: 24450.10, high52: 26277.35, low52: 21280.45, lastUpdated: new Date().toISOString() },
    SENSEX: { symbol: 'SENSEX', name: 'SENSEX', exchange: 'BSE', value: 80604.65, changeVal: 395.20, changePercent: 0.49, prevClose: 80209.45, open: 80300.00, dayHigh: 80720.00, dayLow: 80150.00, high52: 85978.25, low52: 70300.00, lastUpdated: new Date().toISOString() },
    NIFTYBANK: { symbol: 'NIFTYBANK', name: 'NIFTY BANK', exchange: 'NSE', value: 52410.20, changeVal: -115.40, changePercent: -0.22, prevClose: 52525.60, open: 52550.00, dayHigh: 52680.00, dayLow: 52310.00, high52: 54467.35, low52: 44400.00, lastUpdated: new Date().toISOString() },
    NIFTYIT: { symbol: 'NIFTYIT', name: 'NIFTY IT', exchange: 'NSE', value: 41890.80, changeVal: 485.30, changePercent: 1.17, prevClose: 41405.50, open: 41500.00, dayHigh: 42050.00, dayLow: 41450.00, high52: 43850.00, low52: 30500.00, lastUpdated: new Date().toISOString() },
    NIFTYNEXT50: { symbol: 'NIFTYNEXT50', name: 'NIFTY NEXT 50', exchange: 'NSE', value: 71240.10, changeVal: 240.50, changePercent: 0.34, prevClose: 70999.60, open: 71050.00, dayHigh: 71400.00, dayLow: 70900.00, high52: 75200.00, low52: 52000.00, lastUpdated: new Date().toISOString() },
    NIFTYMIDCAP100: { symbol: 'NIFTYMIDCAP100', name: 'NIFTY MIDCAP 100', exchange: 'NSE', value: 58920.30, changeVal: 310.80, changePercent: 0.53, prevClose: 58609.50, open: 58700.00, dayHigh: 59100.00, dayLow: 58600.00, high52: 60500.00, low52: 39000.00, lastUpdated: new Date().toISOString() },
  };

  async getQuote(symbol: string): Promise<Quote | null> {
    const cleanSym = cleanParam(symbol);
    const stock = await StockModel.findBySymbol(cleanSym);
    if (!stock) return null;
    const prevClose = stock.prev_close || stock.cmp - stock.change_val;

    return {
      symbol: stock.symbol,
      companyName: stock.company_name,
      exchange: stock.exchange || 'NSE',
      cmp: stock.cmp,
      changeVal: stock.change_val,
      changePercent: stock.change_percent,
      prevClose,
      open: Number((prevClose * 1.002).toFixed(2)),
      dayHigh: stock.day_high || Math.round(stock.cmp * 1.01),
      dayLow: stock.day_low || Math.round(stock.cmp * 0.99),
      high52: stock.high_52 || Math.round(stock.cmp * 1.2),
      low52: stock.low_52 || Math.round(stock.cmp * 0.8),
      volume: stock.volume || 1000000,
      marketCap: stock.market_cap,
      peRatio: stock.pe_ratio,
      roce: stock.roce,
      divYield: stock.div_yield,
      lastUpdated: stock.updated_at || new Date().toISOString(),
    };
  }

  async getIndexQuote(symbol: string): Promise<IndexQuote | null> {
    const cleanSym = cleanParam(symbol);
    const idx = DemoDataProvider.indexMap[cleanSym] || DemoDataProvider.indexMap['NIFTY50'];
    return { ...idx, lastUpdated: new Date().toISOString() };
  }

  async getHistoricalData(symbol: string, range: string): Promise<ChartPoint[]> {
    const cleanSym = cleanParam(symbol);
    const cleanRange = cleanParam(range, '1D');
    const stock = await StockModel.findBySymbol(cleanSym);
    const basePrice = stock ? stock.cmp : 1000;
    const now = new Date();

    if (cleanRange === '1D') {
      const times = ['09:15', '09:45', '10:15', '10:45', '11:15', '11:45', '12:15', '12:45', '13:15', '13:45', '14:15', '14:45', '15:15', '15:30'];
      return times.map((t, idx) => {
        const wave = Math.sin(idx * 0.6) * 0.008 + (Math.random() - 0.48) * 0.004;
        const p = Number((basePrice * (1 + wave)).toFixed(2));
        return {
          timestamp: `${now.toISOString().split('T')[0]}T${t}:00`,
          label: t,
          open: Number((p * 0.999).toFixed(2)),
          high: Number((p * 1.002).toFixed(2)),
          low: Number((p * 0.998).toFixed(2)),
          close: p,
          price: p,
          volume: Math.floor((stock?.volume || 100000) / 14 + (Math.random() - 0.5) * 10000),
        };
      });
    }

    const pointsCount = cleanRange === '1W' ? 5 : cleanRange === '1M' ? 22 : cleanRange === '3M' ? 65 : cleanRange === '6M' ? 125 : cleanRange === '1Y' ? 250 : 1250;
    let daysInterval = 1;
    if (cleanRange === '1W') daysInterval = 1;
    else if (cleanRange === '1M') daysInterval = 1;
    else if (cleanRange === '3M') daysInterval = 1;
    else if (cleanRange === '6M') daysInterval = 1;
    else if (cleanRange === '1Y') daysInterval = 1;
    else if (cleanRange === '5Y') daysInterval = 5;

    const points: ChartPoint[] = [];
    for (let i = pointsCount; i >= 0; i--) {
      const d = new Date(now.getTime() - i * daysInterval * 24 * 3600 * 1000);
      // Skip weekends
      if (d.getDay() === 0 || d.getDay() === 6) continue;

      const wave = Math.sin(i * 0.3) * 0.05 + Math.cos(i * 0.15) * 0.03 + (Math.random() - 0.49) * 0.01;
      const p = Math.max(10, Number((basePrice * (1 + wave * (i / pointsCount))).toFixed(2)));
      points.push({
        timestamp: d.toISOString(),
        label: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: cleanRange === '5Y' ? '2-digit' : undefined }),
        open: Number((p * 0.995).toFixed(2)),
        high: Number((p * 1.01).toFixed(2)),
        low: Number((p * 0.99).toFixed(2)),
        close: p,
        price: p,
        volume: Math.floor((stock?.volume || 1000000) * (0.8 + Math.random() * 0.5)),
      });
    }

    return points;
  }

  async getIndexHistoricalData(symbol: string, range: string): Promise<ChartPoint[]> {
    const cleanSym = cleanParam(symbol);
    const cleanRange = cleanParam(range, '1D');
    const idx = await this.getIndexQuote(cleanSym);
    const baseValue = idx ? idx.value : 24000;
    const now = new Date();

    if (cleanRange === '1D') {
      const times = ['09:15', '09:45', '10:15', '10:45', '11:15', '11:45', '12:15', '12:45', '13:15', '13:45', '14:15', '14:45', '15:15', '15:30'];
      return times.map((t, i) => {
        const wave = Math.sin(i * 0.5) * 0.005 + (Math.random() - 0.48) * 0.002;
        const p = Number((baseValue * (1 + wave)).toFixed(2));
        return {
          timestamp: `${now.toISOString().split('T')[0]}T${t}:00`,
          label: t,
          open: Number((p * 0.999).toFixed(2)),
          high: Number((p * 1.002).toFixed(2)),
          low: Number((p * 0.998).toFixed(2)),
          close: p,
          price: p,
        };
      });
    }

    const pointsCount = cleanRange === '1W' ? 5 : cleanRange === '1M' ? 22 : cleanRange === '3M' ? 65 : cleanRange === '6M' ? 125 : cleanRange === '1Y' ? 250 : 1250;
    let daysInterval = 1;
    if (cleanRange === '1W') daysInterval = 1;
    else if (cleanRange === '1M') daysInterval = 1;
    else if (cleanRange === '3M') daysInterval = 1;
    else if (cleanRange === '6M') daysInterval = 1;
    else if (cleanRange === '1Y') daysInterval = 1;
    else if (cleanRange === '5Y') daysInterval = 5;

    const points: ChartPoint[] = [];
    for (let i = pointsCount; i >= 0; i--) {
      const d = new Date(now.getTime() - i * daysInterval * 24 * 3600 * 1000);
      if (d.getDay() === 0 || d.getDay() === 6) continue;

      const wave = Math.sin(i * 0.35) * 0.04 + Math.cos(i * 0.12) * 0.02 + (Math.random() - 0.49) * 0.01;
      const p = Math.max(100, Number((baseValue * (1 + wave * (i / pointsCount))).toFixed(2)));
      points.push({
        timestamp: d.toISOString(),
        label: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: cleanRange === '5Y' ? '2-digit' : undefined }),
        open: Number((p * 0.995).toFixed(2)),
        high: Number((p * 1.01).toFixed(2)),
        low: Number((p * 0.99).toFixed(2)),
        close: p,
        price: p,
      });
    }

    return points;
  }

  async getMarketMovers(): Promise<{ gainers: Quote[]; losers: Quote[]; trending: Quote[] }> {
    const stocks = await StockModel.getAll();
    const quotes = await Promise.all(stocks.map(s => this.getQuote(s.symbol)));
    const validQuotes = quotes.filter((q): q is Quote => q !== null);

    const gainers = [...validQuotes].sort((a, b) => b.changePercent - a.changePercent).slice(0, 6);
    const losers = [...validQuotes].sort((a, b) => a.changePercent - b.changePercent).slice(0, 6);
    const trending = [...validQuotes].sort((a, b) => b.volume - a.volume).slice(0, 6);

    return { gainers, losers, trending };
  }
}
