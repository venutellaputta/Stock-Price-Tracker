import { Response } from 'express';
import { WatchlistModel } from '../models/watchlistModel.js';
import { StockModel } from '../models/stockModel.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export class WatchlistController {
  static async getWatchlist(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required to access watchlist.' });
        return;
      }
      const stocks = await WatchlistModel.getByUserId(userId);
      res.json({ success: true, watchlist: stocks });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Unable to load watchlist. Please try again.' });
    }
  }

  static async addToWatchlist(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { symbol } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      if (!symbol) {
        res.status(400).json({ success: false, message: 'Stock symbol is required.' });
        return;
      }

      const stock = await StockModel.findBySymbol(String(symbol));
      if (!stock) {
        res.status(404).json({ success: false, message: `Indian stock '${symbol}' not found.` });
        return;
      }

      const exists = await WatchlistModel.exists(userId, stock.id);
      if (exists) {
        res.status(400).json({ success: false, message: `${stock.symbol} is already in your watchlist.`, stock });
        return;
      }

      const id = generateId();
      await WatchlistModel.add(id, userId, stock.id);

      res.status(201).json({ success: true, message: `${stock.symbol} added to your watchlist.`, stock });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Unable to update watchlist. Please try again.' });
    }
  }

  static async removeFromWatchlist(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const paramStr = String(req.params.identifier || req.params.symbol || '');

      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      // Try looking up by symbol first, or directly by stock_id
      const stock = await StockModel.findBySymbol(paramStr);
      const targetStockId = stock ? stock.id : paramStr;

      await WatchlistModel.remove(userId, targetStockId);
      const symbolLabel = stock ? stock.symbol : 'Stock';

      res.json({ success: true, message: `${symbolLabel} removed from your watchlist.` });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Unable to update watchlist. Please try again.' });
    }
  }
}
