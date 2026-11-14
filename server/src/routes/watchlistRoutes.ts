import { Router } from 'express';
import { WatchlistController } from '../controllers/watchlistController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);
router.get('/', WatchlistController.getWatchlist);
router.post('/', WatchlistController.addToWatchlist);
router.delete('/:identifier', WatchlistController.removeFromWatchlist);

export default router;
