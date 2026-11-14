import { MarketDataFactory } from './marketDataProvider/MarketDataFactory.js';
import { StockModel, Stock } from '../models/stockModel.js';

export class StockApiService {
  /**
   * Ticks or fetches latest live quotes for Indian stocks and syncs DB & WebSockets safely.
   */
  static async updateLiveMarketTicks(): Promise<Stock[]> {
    const provider = MarketDataFactory.getProvider();
    const stocks = await StockModel.getAll();
    const updatedStocks: Stock[] = [];

    for (const stock of stocks) {
      try {
        const liveQuote = await provider.getQuote(stock.symbol);

        if (liveQuote) {
          await StockModel.updatePrice(
            stock.id,
            liveQuote.cmp,
            liveQuote.changeVal,
            liveQuote.changePercent,
            liveQuote.dayHigh,
            liveQuote.dayLow
          );

          updatedStocks.push({
            ...stock,
            cmp: liveQuote.cmp,
            change_val: liveQuote.changeVal,
            change_percent: liveQuote.changePercent,
            day_high: liveQuote.dayHigh,
            day_low: liveQuote.dayLow,
            updated_at: liveQuote.lastUpdated,
          });
        }
      } catch (err: any) {
        // Per-symbol error handling prevents any single failed ticker from destabilizing the WebSocket loop
      }
    }

    return updatedStocks;
  }
}
