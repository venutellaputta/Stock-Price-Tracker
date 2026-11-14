-- PostgreSQL Schema for StockPulse (100% Indian Market NSE/BSE)

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stocks (
    id VARCHAR(36) PRIMARY KEY,
    symbol VARCHAR(20) UNIQUE NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    exchange VARCHAR(50) DEFAULT 'NSE', -- 'NSE' or 'BSE'
    sector VARCHAR(50) NOT NULL,
    cmp DECIMAL(12,2) NOT NULL,
    change_val DECIMAL(12,2) NOT NULL,
    change_percent DECIMAL(8,2) NOT NULL,
    prev_close DECIMAL(12,2),
    day_high DECIMAL(12,2),
    day_low DECIMAL(12,2),
    high_52 DECIMAL(12,2),
    low_52 DECIMAL(12,2),
    volume BIGINT,
    market_cap DECIMAL(20,2), -- In Crores INR
    pe_ratio DECIMAL(8,2),
    roce DECIMAL(8,2),
    div_yield DECIMAL(8,2),
    qtr_profit DECIMAL(14,2),
    sales_var DECIMAL(8,2),
    profit_var DECIMAL(8,2),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS watchlists (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    stock_id VARCHAR(36) REFERENCES stocks(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, stock_id)
);

CREATE TABLE IF NOT EXISTS alerts (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    stock_id VARCHAR(36) REFERENCES stocks(id) ON DELETE CASCADE,
    condition VARCHAR(10) NOT NULL, -- 'ABOVE' or 'BELOW'
    target_price DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'TRIGGERED', 'DISABLED'
    triggered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS price_history (
    id VARCHAR(36) PRIMARY KEY,
    stock_id VARCHAR(36) REFERENCES stocks(id) ON DELETE CASCADE,
    price DECIMAL(12,2) NOT NULL,
    volume BIGINT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS news (
    id VARCHAR(36) PRIMARY KEY,
    stock_id VARCHAR(36) REFERENCES stocks(id) ON DELETE SET NULL,
    symbol VARCHAR(20),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    source VARCHAR(100),
    url VARCHAR(500),
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stocks_symbol ON stocks(symbol);
CREATE INDEX IF NOT EXISTS idx_watchlists_user ON watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_price_history_stock ON price_history(stock_id, timestamp);
