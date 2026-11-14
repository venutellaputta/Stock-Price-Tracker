import { Router } from 'express';
import { StockController } from '../controllers/stockController.js';

const router = Router();

router.get('/search', StockController.search);
router.get('/market-overview', StockController.getMarketOverview);
router.get('/gainers', StockController.getGainers);
router.get('/losers', StockController.getLosers);
router.get('/sectors', StockController.getSectors);
router.get('/:symbol', StockController.getStockBySymbol);
router.get('/:symbol/history', StockController.getHistory);

export default router;
