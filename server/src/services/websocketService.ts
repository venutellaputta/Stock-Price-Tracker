import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { StockApiService } from './stockApiService.js';
import { AlertService } from './alertService.js';

export class WebSocketService {
  private static wss: WebSocketServer | null = null;
  private static tickerInterval: NodeJS.Timeout | null = null;

  static init(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('⚡ Client connected to StockPulse WebSocket');

      ws.send(JSON.stringify({
        type: 'SYSTEM',
        message: 'Connected to StockPulse Real-time Market Stream',
        timestamp: new Date().toISOString(),
      }));

      ws.on('close', () => {
        console.log('⚡ Client disconnected from WebSocket');
      });

      ws.on('error', (err) => {
        console.error('WebSocket Error:', err);
      });
    });

    this.startTicker();
  }

  private static startTicker() {
    if (this.tickerInterval) clearInterval(this.tickerInterval);

    this.tickerInterval = setInterval(async () => {
      try {
        // 1. Tick live price updates
        const updatedStocks = await StockApiService.updateLiveMarketTicks();

        // 2. Check alert conditions
        const newlyTriggeredAlerts = await AlertService.checkAlerts();

        // 3. Broadcast live updates
        if (updatedStocks.length > 0) {
          this.broadcast({
            type: 'STOCK_UPDATE',
            data: updatedStocks,
            timestamp: new Date().toISOString(),
          });
        }

        if (newlyTriggeredAlerts.length > 0) {
          this.broadcast({
            type: 'ALERTS_TRIGGERED',
            data: newlyTriggeredAlerts,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error('Error in WebSocket ticker loop:', err);
      }
    }, 3000);
  }

  public static broadcast(payload: any) {
    if (!this.wss) return;
    const jsonStr = JSON.stringify(payload);

    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(jsonStr);
      }
    });
  }
}
