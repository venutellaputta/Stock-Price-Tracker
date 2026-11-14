import { Router } from 'express';
import { NewsController } from '../controllers/newsController.js';

const router = Router();

router.get('/', NewsController.getNews);
router.get('/article/:id', NewsController.getNewsById);
router.get('/:symbol', NewsController.getNewsBySymbol);

export default router;
