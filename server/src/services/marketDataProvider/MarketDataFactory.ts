import { MarketDataProvider } from './MarketDataProvider.js';
import { DemoDataProvider } from './DemoDataProvider.js';
import { YahooFinanceIndianProvider } from './YahooFinanceIndianProvider.js';
import { UpstoxDataProvider } from './UpstoxDataProvider.js';
import { KiteDataProvider } from './KiteDataProvider.js';

export interface ProviderStatus {
  dataMode: 'live' | 'demo';
  provider: string;
  isLive: boolean;
}

export class MarketDataFactory {
  private static providerInstance: MarketDataProvider | null = null;
  private static status: ProviderStatus = {
    dataMode: 'demo',
    provider: 'demo',
    isLive: false,
  };

  public static getProvider(): MarketDataProvider {
    if (this.providerInstance) return this.providerInstance;

    const dataMode = (process.env.DATA_MODE || 'demo').trim().toLowerCase();
    const providerName = (process.env.MARKET_DATA_PROVIDER || 'yahoo').trim().toLowerCase();

    if (dataMode === 'live') {
      console.log(`🚀 MarketDataFactory: Running in LIVE mode with provider: ${providerName}`);
      if (providerName === 'upstox') {
        this.providerInstance = new UpstoxDataProvider();
      } else if (providerName === 'kite') {
        this.providerInstance = new KiteDataProvider();
      } else {
        this.providerInstance = new YahooFinanceIndianProvider();
      }
      this.status = {
        dataMode: 'live',
        provider: providerName,
        isLive: true,
      };
    } else {
      console.log('💡 MarketDataFactory: Running in DEMO mode');
      this.providerInstance = new DemoDataProvider();
      this.status = {
        dataMode: 'demo',
        provider: 'demo',
        isLive: false,
      };
    }

    return this.providerInstance;
  }

  public static getStatus(): ProviderStatus {
    // Ensure provider instance initialized
    this.getProvider();
    return this.status;
  }
}
