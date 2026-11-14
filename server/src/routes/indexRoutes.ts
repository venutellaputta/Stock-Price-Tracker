import { Router } from 'express';
import { IndexController } from '../controllers/indexController.js';

const router = Router();

router.get('/:symbol', IndexController.getIndexDetails);
router.get('/:symbol/history', IndexController.getIndexHistory);

export default router;
