import { Router } from 'express';
import { AlertController } from '../controllers/alertController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);
router.get('/', AlertController.getAlerts);
router.post('/', AlertController.createAlert);
router.patch('/:id', AlertController.updateAlertStatus);
router.post('/:id/trigger-test', AlertController.triggerTestAlert);
router.delete('/:id', AlertController.deleteAlert);

export default router;
