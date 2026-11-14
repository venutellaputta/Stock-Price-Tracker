import { getDb } from '../database/db.js';

export interface Stock {
  id: string;
  symbol: string;
  company_name: string;
  exchange: string;
  sector: string;
  cmp: number;
  change_val: number;
  change_percent: number;
  prev_close?: number;
  day_high?: number;
  day_low?: number;
  market_cap?: number;
  pe_ratio?: number;
  roce?: number;
  div_yield?: number;
  qtr_profit?: number;
  sales_var?: number;
  profit_var?: number;
  high_52?: number;
  low_52?: number;
  volume?: number;
  updated_at?: string;
}

export interface PriceHistory {
  id: string;
  stock_id: string;
  price: number;
  volume: number;
  timestamp: string;
}

export class StockModel {
  static async getAll(): Promise<Stock[]> {
    const db = await getDb();
    return db.all('SELECT * FROM stocks ORDER BY company_name ASC');
  }

  static async findBySymbol(symbol: string): Promise<Stock | undefined> {
    const db = await getDb();
    return db.get('SELECT * FROM stocks WHERE UPPER(symbol) = UPPER(?)', [symbol]);
  }

  static async search(query: string): Promise<Stock[]> {
    const db = await getDb();
    const pattern = `%${query}%`;
    return db.all(
      'SELECT * FROM stocks WHERE UPPER(symbol) LIKE UPPER(?) OR UPPER(company_name) LIKE UPPER(?) ORDER BY symbol ASC LIMIT 20',
      [pattern, pattern]
    );
  }

  static async getGainers(limit = 6): Promise<Stock[]> {
    const db = await getDb();
    return db.all('SELECT * FROM stocks ORDER BY change_percent DESC LIMIT ?', [limit]);
  }

  static async getLosers(limit = 6): Promise<Stock[]> {
    const db = await getDb();
    return db.all('SELECT * FROM stocks ORDER BY change_percent ASC LIMIT ?', [limit]);
  }

  static async getTrending(limit = 6): Promise<Stock[]> {
    const db = await getDb();
    return db.all('SELECT * FROM stocks ORDER BY volume DESC LIMIT ?', [limit]);
  }

  static async updatePrice(
    id: string,
    newCmp: number,
    changeVal: number,
    changePercent: number,
    dayHigh?: number,
    dayLow?: number
  ): Promise<void> {
    const db = await getDb();
    await db.run(
      `UPDATE stocks SET 
        cmp = ?, 
        change_val = ?, 
        change_percent = ?, 
        day_high = MAX(COALESCE(day_high, ?), ?),
        day_low = MIN(COALESCE(day_low, ?), ?),
        updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?`,
      [newCmp, changeVal, changePercent, newCmp, newCmp, newCmp, newCmp, id]
    );
  }

  static async getHistory(stockId: string, limit = 100): Promise<PriceHistory[]> {
    const db = await getDb();
    return db.all(
      'SELECT * FROM price_history WHERE stock_id = ? ORDER BY timestamp ASC LIMIT ?',
      [stockId, limit]
    );
  }

  static async addPriceHistory(id: string, stockId: string, price: number, volume: number, timestamp?: string): Promise<void> {
    const db = await getDb();
    await db.run(
      'INSERT INTO price_history (id, stock_id, price, volume, timestamp) VALUES (?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP))',
      [id, stockId, price, volume, timestamp || null]
    );
  }

  static async getBySectors(): Promise<{ sector: string; count: number; avg_change: number; top_stocks: Stock[] }[]> {
    const db = await getDb();
    const sectors = await db.all<{ sector: string; count: number; avg_change: number }[]>(
      'SELECT sector, COUNT(*) as count, AVG(change_percent) as avg_change FROM stocks GROUP BY sector ORDER BY count DESC'
    );

    const result = [];
    for (const sec of sectors) {
      const top_stocks = await db.all<Stock[]>(
        'SELECT * FROM stocks WHERE sector = ? ORDER BY market_cap DESC LIMIT 6',
        [sec.sector]
      );
      result.push({
        sector: sec.sector,
        count: sec.count,
        avg_change: Number((sec.avg_change || 0).toFixed(2)),
        top_stocks
      });
    }

    return result;
  }
}
