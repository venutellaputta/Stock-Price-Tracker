import { Request, Response } from 'express';
import { NewsModel } from '../models/newsModel.js';

export class NewsController {
  static async getNews(req: Request, res: Response): Promise<void> {
    try {
      const symbolQuery = (req.query.symbol as string) || '';
      let news;
      if (symbolQuery.trim()) {
        news = await NewsModel.getBySymbol(symbolQuery.trim());
      } else {
        news = await NewsModel.getAll(30);
      }
      res.json({ success: true, news });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Unable to load news feed. Please try again.' });
    }
  }

  static async getNewsBySymbol(req: Request, res: Response): Promise<void> {
    try {
      const symbol = String(req.params.symbol);
      const news = await NewsModel.getBySymbol(symbol, 15);
      res.json({ success: true, news });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Unable to load news for symbol.' });
    }
  }

  static async getNewsById(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const item = await NewsModel.getById(id);
      if (!item) {
        res.status(404).json({ success: false, message: 'Article not found.' });
        return;
      }
      res.json({ success: true, article: item });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Unable to load article content.' });
    }
  }
}
