import { getDb } from '../database/db.js';
import { Stock } from './stockModel.js';

export interface Alert {
  id: string;
  user_id: string;
  stock_id: string;
  condition: 'ABOVE' | 'BELOW';
  target_price: number;
  status: 'ACTIVE' | 'TRIGGERED' | 'DISABLED';
  triggered_at?: string;
  created_at: string;
  stock?: Stock;
}

export class AlertModel {
  static async getByUserId(userId: string): Promise<Alert[]> {
    const db = await getDb();
    const rows = await db.all<any[]>(
      `SELECT a.*, s.symbol, s.company_name, s.cmp, s.change_val, s.change_percent
       FROM alerts a
       JOIN stocks s ON a.stock_id = s.id
       WHERE a.user_id = ?
       ORDER BY a.created_at DESC`,
      [userId]
    );

    return rows.map(r => ({
      id: r.id,
      user_id: r.user_id,
      stock_id: r.stock_id,
      condition: r.condition,
      target_price: r.target_price,
      status: r.status,
      triggered_at: r.triggered_at,
      created_at: r.created_at,
      stock: {
        id: r.stock_id,
        symbol: r.symbol,
        company_name: r.company_name,
        exchange: 'NSE',
        sector: 'General',
        cmp: r.cmp,
        change_val: r.change_val,
        change_percent: r.change_percent,
      }
    }));
  }

  static async getActiveAlerts(): Promise<Alert[]> {
    const db = await getDb();
    const rows = await db.all<any[]>(
      `SELECT a.*, s.symbol, s.company_name, s.cmp
       FROM alerts a
       JOIN stocks s ON a.stock_id = s.id
       WHERE a.status = 'ACTIVE'`
    );

    return rows.map(r => ({
      id: r.id,
      user_id: r.user_id,
      stock_id: r.stock_id,
      condition: r.condition,
      target_price: r.target_price,
      status: r.status,
      triggered_at: r.triggered_at,
      created_at: r.created_at,
      stock: {
        id: r.stock_id,
        symbol: r.symbol,
        company_name: r.company_name,
        exchange: 'NSE',
        sector: 'General',
        cmp: r.cmp,
        change_val: 0,
        change_percent: 0,
      }
    }));
  }

  static async create(
    id: string,
    userId: string,
    stockId: string,
    condition: 'ABOVE' | 'BELOW',
    targetPrice: number
  ): Promise<void> {
    const db = await getDb();
    await db.run(
      'INSERT INTO alerts (id, user_id, stock_id, condition, target_price, status) VALUES (?, ?, ?, ?, ?, ?)',
      [id, userId, stockId, condition, targetPrice, 'ACTIVE']
    );
  }

  static async updateStatus(id: string, status: 'ACTIVE' | 'TRIGGERED' | 'DISABLED', triggeredAt?: string): Promise<void> {
    const db = await getDb();
    if (status === 'TRIGGERED') {
      await db.run(
        'UPDATE alerts SET status = ?, triggered_at = COALESCE(?, CURRENT_TIMESTAMP) WHERE id = ?',
        [status, triggeredAt || null, id]
      );
    } else {
      await db.run('UPDATE alerts SET status = ? WHERE id = ?', [status, id]);
    }
  }

  static async delete(id: string, userId: string): Promise<void> {
    const db = await getDb();
    await db.run('DELETE FROM alerts WHERE id = ? AND user_id = ?', [id, userId]);
  }

  static async getById(id: string): Promise<Alert | undefined> {
    const db = await getDb();
    return db.get('SELECT * FROM alerts WHERE id = ?', [id]);
  }
}
