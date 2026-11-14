import { Request, Response } from 'express';
import { MarketDataFactory } from '../services/marketDataProvider/MarketDataFactory.js';
import { cleanParam } from '../utils/cleanParam.js';
import { ChartPoint } from '../services/marketDataProvider/MarketDataProvider.js';

export class IndexController {
  static async getIndexDetails(req: Request, res: Response): Promise<void> {
    try {
      const cleanSymbol = cleanParam(req.params.symbol);
      const provider = MarketDataFactory.getProvider();
      const status = MarketDataFactory.getStatus();

      let indexQuote = null;
      try {
        indexQuote = await provider.getIndexQuote(cleanSymbol);
      } catch (err: any) {
        if (status.dataMode === 'live') {
          res.status(503).json({
            success: false,
            error: 'LIVE_DATA_UNAVAILABLE',
            message: `Live market index provider is unavailable for '${cleanSymbol}'.`,
            dataMode: status.dataMode,
            provider: status.provider,
            isLive: false,
          });
          return;
        }
      }

      if (!indexQuote) {
        res.status(404).json({ success: false, error: 'INDEX_NOT_FOUND', message: `Market Index '${cleanSymbol}' not found.` });
        return;
      }

      res.json({
        success: true,
        symbol: cleanSymbol,
        index: indexQuote,
        dataMode: status.dataMode,
        provider: status.provider,
        isLive: status.isLive && indexQuote !== null,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message || 'Unable to retrieve live market index data. Please try again.' });
    }
  }

  static async getIndexHistory(req: Request, res: Response): Promise<void> {
    try {
      const cleanSymbol = cleanParam(req.params.symbol);
      const cleanRange = cleanParam(req.query.range, '1D');
      const provider = MarketDataFactory.getProvider();
      const status = MarketDataFactory.getStatus();

      let history: ChartPoint[] = [];
      try {
        history = await provider.getIndexHistoricalData(cleanSymbol, cleanRange);
      } catch (err: any) {
        if (status.dataMode === 'live') {
          res.status(503).json({
            success: false,
            error: 'HISTORICAL_DATA_UNAVAILABLE',
            message: `Historical index data temporarily unavailable for '${cleanSymbol}'.`,
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
      res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message || 'Historical index data temporarily unavailable.' });
    }
  }
}
