import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import stockRoutes from './routes/stockRoutes.js';
import indexRoutes from './routes/indexRoutes.js';
import watchlistRoutes from './routes/watchlistRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import compareRoutes from './routes/compareRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import marketDataRoutes from './routes/marketDataRoutes.js';

import { errorHandler } from './middleware/errorHandler.js';
import { getDb } from './database/db.js';
import { seedDatabase } from './database/seed.js';
import { WebSocketService } from './services/websocketService.js';
import { MarketDataFactory } from './services/marketDataProvider/MarketDataFactory.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));

app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api', limiter);

app.get('/api/health', async (req, res) => {
  const status = MarketDataFactory.getStatus();
  res.json({
    status: 'OK',
    service: 'StockPulse Indian Market Server',
    dataMode: status.dataMode,
    provider: status.provider,
    isLive: status.isLive,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/indices', indexRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/compare', compareRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/market-data', marketDataRoutes);

app.use(errorHandler);

const server = http.createServer(app);

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Error: Port ${PORT} is already in use by another running process.`);
    console.error(`👉 Solution: Stop existing node processes or change PORT in server/.env.\n`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});

async function startServer() {
  try {
    console.log('⚡ Initializing Database...');
    await getDb();

    console.log('🌱 Checking seed data...');
    await seedDatabase();

    WebSocketService.init(server);

    const provider = MarketDataFactory.getProvider();
    const status = MarketDataFactory.getStatus();

    console.log('\n========================================');
    console.log('StockPulse Market Data Configuration');
    console.log('========================================');
    console.log(`DATA_MODE: ${status.dataMode}`);
    console.log(`PROVIDER: ${status.provider}`);

    if (status.dataMode === 'live') {
      try {
        const tcsQuote = await provider.getQuote('TCS');
        const niftyQuote = await provider.getIndexQuote('NIFTY50');
        console.log(`TCS Live Quote: ₹${tcsQuote?.cmp || 'N/A'}`);
        console.log(`NIFTY 50 Live Quote: ${niftyQuote?.value || 'N/A'}`);
        console.log('Provider status: CONNECTED');
      } catch (err: any) {
        console.warn(`⚠️ Provider status warning: ${err.message}`);
      }
    } else {
      console.log('Provider status: DEMO MODE ACTIVE');
    }
    console.log('========================================\n');

    server.listen(PORT, () => {
      console.log(`🚀 StockPulse Server running on http://localhost:${PORT}`);
      console.log(`⚡ WebSocket Stream available on ws://localhost:${PORT}/ws`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
