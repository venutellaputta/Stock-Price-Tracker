import { Request, Response } from 'express';
import { StockModel } from '../models/stockModel.js';

export class CompareController {
  static async compareStocks(req: Request, res: Response): Promise<void> {
    try {
      const symbolsStr = (req.query.symbols as string) || 'TCS,INFY';
      const symbols = symbolsStr.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);

      if (symbols.length < 2) {
        res.status(400).json({ success: false, message: 'Please select at least 2 Indian stocks to compare (e.g. ?symbols=TCS,INFY).' });
        return;
      }

      const stocks = [];
      for (const sym of symbols.slice(0, 4)) {
        const stock = await StockModel.findBySymbol(sym);
        if (stock) {
          stocks.push(stock);
        }
      }

      if (stocks.length === 0) {
        res.status(404).json({ success: false, message: 'None of the specified Indian stock symbols were found.' });
        return;
      }

      const pointsCount = 30;
      const comparativeHistory = [];
      const now = Date.now();

      for (let i = pointsCount; i >= 0; i--) {
        const time = new Date(now - i * 24 * 3600 * 1000);
        const dataPoint: Record<string, any> = {
          date: time.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
          timestamp: time.toISOString(),
        };

        stocks.forEach((stk, idx) => {
          const wave = Math.sin(i * (0.3 + idx * 0.1)) * 0.04 + Math.cos(i * 0.15) * 0.02;
          const price = Math.max(10, Number((stk.cmp * (1 + wave * (i / pointsCount))).toFixed(2)));
          dataPoint[stk.symbol] = price;
          const basePrice = stk.cmp * 0.95;
          dataPoint[`${stk.symbol}_pct`] = Number((((price - basePrice) / basePrice) * 100).toFixed(2));
        });

        comparativeHistory.push(dataPoint);
      }

      res.json({
        success: true,
        stocks,
        history: comparativeHistory,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error executing stock comparison.' });
    }
  }
}
