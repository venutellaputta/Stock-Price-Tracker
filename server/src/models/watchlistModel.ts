import { getDb } from '../database/db.js';
import { Stock } from './stockModel.js';

export interface WatchlistItem {
  id: string;
  user_id: string;
  stock_id: string;
  created_at: string;
  stock?: Stock;
}

export class WatchlistModel {
  static async getByUserId(userId: string): Promise<Stock[]> {
    const db = await getDb();
    return db.all(
      `SELECT s.* FROM stocks s
       JOIN watchlists w ON s.id = w.stock_id
       WHERE w.user_id = ?
       ORDER BY w.created_at DESC`,
      [userId]
    );
  }

  static async add(id: string, userId: string, stockId: string): Promise<void> {
    const db = await getDb();
    await db.run(
      'INSERT OR IGNORE INTO watchlists (id, user_id, stock_id) VALUES (?, ?, ?)',
      [id, userId, stockId]
    );
  }

  static async remove(userId: string, stockId: string): Promise<void> {
    const db = await getDb();
    await db.run('DELETE FROM watchlists WHERE user_id = ? AND stock_id = ?', [userId, stockId]);
  }

  static async exists(userId: string, stockId: string): Promise<boolean> {
    const db = await getDb();
    const row = await db.get(
      'SELECT id FROM watchlists WHERE user_id = ? AND stock_id = ?',
      [userId, stockId]
    );
    return !!row;
  }
}
