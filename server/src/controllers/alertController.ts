import { Response } from 'express';
import { AlertModel } from '../models/alertModel.js';
import { StockModel } from '../models/stockModel.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { WebSocketService } from '../services/websocketService.js';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export class AlertController {
  static async getAlerts(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }
      const alerts = await AlertModel.getByUserId(userId);
      res.json({ success: true, alerts });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Unable to load alerts. Please try again.' });
    }
  }

  static async createAlert(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { symbol, condition, targetPrice } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      if (!symbol || !condition || !targetPrice) {
        res.status(400).json({ success: false, message: 'Stock symbol, condition (ABOVE/BELOW), and target price are required.' });
        return;
      }

      if (!['ABOVE', 'BELOW'].includes(condition.toUpperCase())) {
        res.status(400).json({ success: false, message: 'Condition must be either ABOVE or BELOW.' });
        return;
      }

      const stock = await StockModel.findBySymbol(String(symbol));
      if (!stock) {
        res.status(404).json({ success: false, message: `Indian stock '${symbol}' not found.` });
        return;
      }

      const id = generateId();
      const priceVal = Number(targetPrice);
      await AlertModel.create(id, userId, stock.id, condition.toUpperCase() as 'ABOVE' | 'BELOW', priceVal);

      res.status(201).json({
        success: true,
        message: `Alert set for ${stock.symbol} when price goes ${condition} ₹${priceVal}`,
        alert: {
          id,
          user_id: userId,
          stock_id: stock.id,
          condition: condition.toUpperCase(),
          target_price: priceVal,
          status: 'ACTIVE',
          stock
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Unable to create alert. Please try again.' });
    }
  }

  static async updateAlertStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const id = String(req.params.id);
      const { status } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      if (!['ACTIVE', 'DISABLED'].includes(status)) {
        res.status(400).json({ success: false, message: 'Status must be ACTIVE or DISABLED.' });
        return;
      }

      await AlertModel.updateStatus(id, status);
      res.json({ success: true, message: `Alert status updated to ${status}.` });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Unable to update alert status.' });
    }
  }

  static async deleteAlert(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const id = String(req.params.id);

      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      await AlertModel.delete(id, userId);
      res.json({ success: true, message: 'Alert deleted successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Unable to delete alert.' });
    }
  }

  /**
   * Academic Project Test Trigger Endpoint
   */
  static async triggerTestAlert(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const id = String(req.params.id);

      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const now = new Date().toISOString();
      await AlertModel.updateStatus(id, 'TRIGGERED', now);
      const alert = await AlertModel.getById(id);
      const stock = alert ? await StockModel.findBySymbol(alert.stock_id) || alert.stock : null;

      WebSocketService.broadcast({
        type: 'ALERTS_TRIGGERED',
        data: [{ ...alert, stock, status: 'TRIGGERED', triggered_at: now }],
        timestamp: now,
      });

      res.json({ success: true, message: 'Alert triggered for demonstration test.', alert });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error executing test alert trigger.' });
    }
  }
}
