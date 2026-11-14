import { Request, Response } from 'express';
import { MarketDataFactory } from '../services/marketDataProvider/MarketDataFactory.js';
import { YahooFinanceIndianProvider } from '../services/marketDataProvider/YahooFinanceIndianProvider.js';

export class MarketDataController {
  static async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = MarketDataFactory.getStatus();
      res.json({
        success: true,
        mode: status.dataMode,
        provider: status.provider,
        isLive: status.isLive,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error fetching market data status.' });
    }
  }

  static async getHealth(req: Request, res: Response): Promise<void> {
    try {
      const status = MarketDataFactory.getStatus();
      const provider = MarketDataFactory.getProvider();

      let symbolsReport: Record<string, any> = {};
      if (provider instanceof YahooFinanceIndianProvider) {
        symbolsReport = await provider.getHealthStatus();
      } else {
        const testSymbols = ['TCS', 'INFY', 'RELIANCE', 'HDFCBANK', 'SBIN', 'TATAMOTORS'];
        for (const sym of testSymbols) {
          const q = await provider.getQuote(sym);
          symbolsReport[sym] = {
            symbol: sym,
            providerSymbol: `${sym}.NS`,
            available: q !== null,
            price: q ? q.cmp : null,
            status: q ? 'LIVE' : 'UNAVAILABLE',
            lastUpdated: q ? q.lastUpdated : undefined,
          };
        }
      }

      res.json({
        success: true,
        mode: status.dataMode,
        provider: status.provider,
        isLive: status.isLive,
        symbols: symbolsReport,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error executing market data health check.' });
    }
  }
}
