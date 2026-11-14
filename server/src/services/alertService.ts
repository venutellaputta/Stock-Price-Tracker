import { AlertModel, Alert } from '../models/alertModel.js';

export class AlertService {
  /**
   * Checks active alerts against current stock prices in database.
   * Marks matched active alerts as TRIGGERED and updates triggered_at.
   * Already triggered or disabled alerts are ignored to prevent repeated notifications.
   */
  static async checkAlerts(): Promise<Alert[]> {
    const activeAlerts = await AlertModel.getActiveAlerts();
    const newlyTriggeredAlerts: Alert[] = [];

    for (const alert of activeAlerts) {
      if (!alert.stock || alert.status !== 'ACTIVE') continue;

      const currentPrice = alert.stock.cmp;
      let isTriggered = false;

      if (alert.condition === 'ABOVE' && currentPrice >= alert.target_price) {
        isTriggered = true;
      } else if (alert.condition === 'BELOW' && currentPrice <= alert.target_price) {
        isTriggered = true;
      }

      if (isTriggered) {
        const now = new Date().toISOString();
        await AlertModel.updateStatus(alert.id, 'TRIGGERED', now);
        newlyTriggeredAlerts.push({
          ...alert,
          status: 'TRIGGERED',
          triggered_at: now,
        });
      }
    }

    return newlyTriggeredAlerts;
  }
}
