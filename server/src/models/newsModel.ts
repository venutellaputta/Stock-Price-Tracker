import { getDb } from '../database/db.js';

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

export class NewsModel {
  static async getAll(limit = 30): Promise<NewsItem[]> {
    const db = await getDb();
    return db.all('SELECT * FROM news ORDER BY published_at DESC LIMIT ?', [limit]);
  }

  static async getBySymbol(symbol: string, limit = 15): Promise<NewsItem[]> {
    const db = await getDb();
    return db.all(
      'SELECT * FROM news WHERE UPPER(symbol) = UPPER(?) ORDER BY published_at DESC LIMIT ?',
      [symbol, limit]
    );
  }

  static async getById(id: string): Promise<NewsItem | undefined> {
    const db = await getDb();
    return db.get('SELECT * FROM news WHERE id = ?', [id]);
  }
}
