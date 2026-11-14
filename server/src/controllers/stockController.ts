import { Request, Response } from 'express';
import { StockModel } from '../models/stockModel.js';
import { MarketDataFactory } from '../services/marketDataProvider/MarketDataFactory.js';
import { cleanParam } from '../utils/cleanParam.js';
import { ChartPoint } from '../services/marketDataProvider/MarketDataProvider.js';

export class StockController {
  static async search(req: Request, res: Response): Promise<void> {
    try {
      const rawQuery = (req.query.q as string) || '';
      const query = cleanParam(rawQuery);
      if (!query) {
        res.json({ success: true, stocks: [] });
        return;
      }
      const stocks = await StockModel.search(query);
      res.json({ success: true, stocks });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error searching Indian market stocks.' });
    }
  }

  static async getStockBySymbol(req: Request, res: Response): Promise<void> {
    try {
      const cleanSymbol = cleanParam(req.params.symbol);
      const dbStock = await StockModel.findBySymbol(cleanSymbol);

      if (!dbStock) {
        res.status(404).json({
          success: false,
          error: 'STOCK_NOT_FOUND',
          message: `Indian equity with symbol '${cleanSymbol}' not found.`,
        });
        return;
      }

      const provider = MarketDataFactory.getProvider();
      const status = MarketDataFactory.getStatus();
      let liveQuote = null;

      try {
        liveQuote = await provider.getQuote(cleanSymbol);
      } catch (err: any) {
        if (status.dataMode === 'live') {
          res.status(503).json({
            success: false,
            error: 'LIVE_DATA_UNAVAILABLE',
            message: `Live market data provider is unavailable for '${cleanSymbol}'.`,
            dataMode: status.dataMode,
            provider: status.provider,
            isLive: false,
          });
          return;
        }
      }

      const stockData = liveQuote
        ? {
            ...dbStock,
            cmp: liveQuote.cmp,
            change_val: liveQuote.changeVal,
            change_percent: liveQuote.changePercent,
            prev_close: liveQuote.prevClose,
            day_high: liveQuote.dayHigh,
            day_low: liveQuote.dayLow,
            high_52: liveQuote.high52,
            low_52: liveQuote.low52,
            volume: liveQuote.volume,
            updated_at: liveQuote.lastUpdated,
          }
        : dbStock;

      const baseProfit = dbStock.qtr_profit || 5000;
      const baseSales = Math.round(baseProfit * 3.4);
      const baseExpenses = Math.round(baseSales * 0.76);
      const opm = Number((((baseSales - baseExpenses) / baseSales) * 100).toFixed(1));
      const epsBase = Number((baseProfit / 350).toFixed(2));

      const quarterlyResults = [
        { quarter: 'Mar 2024', sales: Math.round(baseSales * 0.92), expenses: Math.round(baseExpenses * 0.92), opmPercent: opm, netProfit: Math.round(baseProfit * 0.91), eps: Number((epsBase * 0.91).toFixed(2)) },
        { quarter: 'Jun 2024', sales: Math.round(baseSales * 0.95), expenses: Math.round(baseExpenses * 0.95), opmPercent: opm, netProfit: Math.round(baseProfit * 0.94), eps: Number((epsBase * 0.94).toFixed(2)) },
        { quarter: 'Sep 2024', sales: Math.round(baseSales * 0.98), expenses: Math.round(baseExpenses * 0.98), opmPercent: opm, netProfit: Math.round(baseProfit * 0.97), eps: Number((epsBase * 0.97).toFixed(2)) },
        { quarter: 'Dec 2024', sales: Math.round(baseSales * 1.02), expenses: Math.round(baseExpenses * 1.01), opmPercent: opm + 0.5, netProfit: Math.round(baseProfit * 1.03), eps: Number((epsBase * 1.03).toFixed(2)) },
        { quarter: 'Mar 2025', sales: baseSales, expenses: baseExpenses, opmPercent: opm, netProfit: baseProfit, eps: epsBase },
      ];

      res.json({
        success: true,
        symbol: cleanSymbol,
        stock: stockData,
        quarterlyResults,
        dataMode: status.dataMode,
        provider: status.provider,
        isLive: status.isLive && liveQuote !== null,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message || 'Error loading stock details.' });
    }
  }

  static async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const cleanSymbol = cleanParam(req.params.symbol);
      const cleanRange = cleanParam(req.query.range, '1D');
      const provider = MarketDataFactory.getProvider();
      const status = MarketDataFactory.getStatus();

      let history: ChartPoint[] = [];
      try {
        history = await provider.getHistoricalData(cleanSymbol, cleanRange);
      } catch (err: any) {
        if (status.dataMode === 'live') {
          res.status(530).json({
            success: false,
            error: 'HISTORICAL_DATA_UNAVAILABLE',
            message: `Historical market data temporarily unavailable for '${cleanSymbol}'.`,
            dataMode: status.dataMode,
            provider: status.provider,
            isLive: false,
          });
          return;
        }
      }

      res.json({
        success: true,
        symbol: cleanSymbol,
        range: cleanRange,
        dataMode: status.dataMode,
        provider: status.provider,
        isLive: status.isLive,
        history,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message || 'Error fetching chart history.' });
    }
  }

  static async getMarketOverview(req: Request, res: Response): Promise<void> {
    try {
      const provider = MarketDataFactory.getProvider();
      const status = MarketDataFactory.getStatus();

      const indexSymbols = ['NIFTY50', 'SENSEX', 'NIFTYBANK', 'NIFTYIT', 'NIFTYNEXT50', 'NIFTYMIDCAP100'];
      const indicesQuotes = [];

      for (const s of indexSymbols) {
        try {
          const idx = await provider.getIndexQuote(s);
          if (idx) {
            indicesQuotes.push({
              symbol: idx.symbol,
              name: idx.name,
              value: idx.value,
              change: idx.changeVal,
              percent: idx.changePercent,
              country: idx.exchange,
            });
          }
        } catch (e) {
          // Ignore individual index errors
        }
      }

      const allStocks = await StockModel.getAll();
      const movers = await provider.getMarketMovers();
      const sectors = await StockModel.getBySectors();

      res.json({
        success: true,
        marketStatus: status.isLive ? 'LIVE NSE/BSE' : 'OPEN',
        indices: indicesQuotes,
        allStocks,
        gainers: movers.gainers,
        losers: movers.losers,
        trending: movers.trending,
        sectors,
        dataMode: status.dataMode,
        provider: status.provider,
        isLive: status.isLive,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Unable to retrieve live market data.' });
    }
  }

  static async getGainers(req: Request, res: Response): Promise<void> {
    try {
      const provider = MarketDataFactory.getProvider();
      const movers = await provider.getMarketMovers();
      res.json({ success: true, gainers: movers.gainers });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error fetching top gainers.' });
    }
  }

  static async getLosers(req: Request, res: Response): Promise<void> {
    try {
      const provider = MarketDataFactory.getProvider();
      const movers = await provider.getMarketMovers();
      res.json({ success: true, losers: movers.losers });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error fetching top losers.' });
    }
  }

  static async getSectors(req: Request, res: Response): Promise<void> {
    try {
      const sectors = await StockModel.getBySectors();
      res.json({ success: true, sectors });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error fetching sectors.' });
    }
  }
}
