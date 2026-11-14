import { Router } from 'express';
import { CompareController } from '../controllers/compareController.js';

const router = Router();

router.get('/', CompareController.compareStocks);

export default router;
