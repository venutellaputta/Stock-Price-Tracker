# StockPulse — Real-Time Indian Stock Market Dashboard

StockPulse is a full-stack real-time stock price tracker, interactive charting, watchlist, price alert, and financial analytics platform focused 100% on the **Indian Stock Market (NSE / BSE)**.

---

## 🇮🇳 Market Data Provider Integration Architecture

```text
React Frontend (Vite + TypeScript)
       │
       ▼
Node.js / Express Backend API & WebSockets
       │
       ▼
MarketDataFactory Service
       │
   ┌───┴──────────────────────────────┬──────────────────────────────┐
   ▼                                  ▼                              ▼
YahooFinanceIndianProvider    UpstoxDataProvider           KiteDataProvider
(Authorized NSE/BSE API)     (Upstox Market Data API)    (Zerodha Kite Connect)
```

---

## ⚙️ Configuration & Environment Variables

Create or edit `server/.env`:

```env
# Mode: live or demo
DATA_MODE=live

# Market Data Provider: yahoo, upstox, or kite
MARKET_DATA_PROVIDER=yahoo

# Optional Provider Credentials (Required if using upstox or kite)
UPSTOX_API_KEY=your_upstox_api_key
UPSTOX_API_SECRET=your_upstox_api_secret
UPSTOX_ACCESS_TOKEN=your_upstox_access_token

KITE_API_KEY=your_kite_api_key
KITE_API_SECRET=your_kite_api_secret
KITE_ACCESS_TOKEN=your_kite_access_token
```

### Modes & Status Badging:
* **`DATA_MODE=live`**: Fetches real-time prices & historical intraday candles directly from the configured provider. Badged as `LIVE NSE/BSE`.
* **`DATA_MODE=demo`**: Uses seeded demo prices with controlled realistic ticks. Badged as `DEMO DATA`.

---

## 📋 Data Source & Licensing Specifications

* **Market Data Source**: Yahoo Finance / Upstox API / Zerodha Kite Connect
* **Mode Supported**: Live / Demo
* **Real-Time Data**: Yes (NSE & BSE streaming tick prices)
* **Historical Data**: Yes (1D intraday timestamps `09:15` to `15:30`, 1W, 1M, 3M, 6M, 1Y, 5Y)
* **Exchange Scope**: National Stock Exchange (NSE) & Bombay Stock Exchange (BSE)

> **Licensing & Usage Disclaimer**: Exchange market data from NSE and BSE is subject to exchange licensing rules. For commercial redistribution or production deployment, an authorized broker API license or exchange data vendor agreement must be maintained.

---

## 🚀 Running the Project

### 1. Build Server & Client
```bash
cd server
npm run build

cd ../client
npm run build
```

### 2. Start Application
```bash
# Terminal 1 (Server)
cd server
npm run start

# Terminal 2 (Client)
cd client
npm run dev
```

Open **`http://localhost:5173`** in your browser.

---

## 🔗 Key Routes & Navigation
* `/dashboard` — Executive Indian Market Dashboard with 6 clickable index cards & Financial Performance Matrix.
* `/index/:symbol` — Market Index details & intraday Recharts chart (e.g. `/index/NIFTY50`, `/index/SENSEX`, `/index/NIFTYBANK`, `/index/NIFTYIT`, `/index/NIFTYNEXT50`, `/index/NIFTYMIDCAP100`).
* `/stock/:symbol` — Dynamic Indian equity profile & historical chart (e.g. `/stock/TCS`, `/stock/INFY`, `/stock/RELIANCE`, `/stock/HDFCBANK`).
* `/watchlist` — Saved user watchlist with live WebSocket price ticks & sparklines.
* `/alerts` — Price target alert engine & presentation test trigger.
* `/news` — Indian financial news reader with internal article modal.
* `/compare` — Multi-stock side-by-side comparison matrix.
