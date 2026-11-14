import { Router } from 'express';
import { MarketDataController } from '../controllers/marketDataController.js';

const router = Router();

router.get('/status', MarketDataController.getStatus);
router.get('/health', MarketDataController.getHealth);

export default router;
