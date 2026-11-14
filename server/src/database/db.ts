import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance;

  const dbPath = process.env.DATABASE_URL || 'stockpulse.db';
  const fullPath = path.isAbsolute(dbPath) ? dbPath : path.join(process.cwd(), dbPath);

  dbInstance = await open({
    filename: fullPath,
    driver: sqlite3.Database,
  });

  await dbInstance.run('PRAGMA foreign_keys = ON;');
  await initTables(dbInstance);

  return dbInstance;
}

async function initTables(db: Database) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS stocks (
      id TEXT PRIMARY KEY,
      symbol TEXT UNIQUE NOT NULL,
      company_name TEXT NOT NULL,
      exchange TEXT DEFAULT 'NSE',
      sector TEXT NOT NULL,
      cmp REAL NOT NULL,
      change_val REAL NOT NULL,
      change_percent REAL NOT NULL,
      prev_close REAL,
      day_high REAL,
      day_low REAL,
      high_52 REAL,
      low_52 REAL,
      volume INTEGER,
      market_cap REAL,
      pe_ratio REAL,
      roce REAL,
      div_yield REAL,
      qtr_profit REAL,
      sales_var REAL,
      profit_var REAL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS watchlists (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      stock_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(stock_id) REFERENCES stocks(id) ON DELETE CASCADE,
      UNIQUE(user_id, stock_id)
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      stock_id TEXT NOT NULL,
      condition TEXT NOT NULL,
      target_price REAL NOT NULL,
      status TEXT DEFAULT 'ACTIVE',
      triggered_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(stock_id) REFERENCES stocks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS price_history (
      id TEXT PRIMARY KEY,
      stock_id TEXT NOT NULL,
      price REAL NOT NULL,
      volume INTEGER,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(stock_id) REFERENCES stocks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS news (
      id TEXT PRIMARY KEY,
      stock_id TEXT,
      symbol TEXT,
      title TEXT NOT NULL,
      description TEXT,
      content TEXT,
      source TEXT,
      url TEXT,
      published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(stock_id) REFERENCES stocks(id) ON DELETE SET NULL
    );
  `);

  // Migrate columns safely if missing
  try {
    await db.exec(`
      ALTER TABLE stocks ADD COLUMN prev_close REAL;
      ALTER TABLE stocks ADD COLUMN day_high REAL;
      ALTER TABLE stocks ADD COLUMN day_low REAL;
    `);
  } catch (e) {
    // Columns already exist
  }
}
