import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { stockService } from '../services/api';
import { Stock, MarketIndex } from '../types';
import { formatCurrency, formatPercent } from '../utils/formatters';
import {
  TrendingUp,
  LineChart,
  Bell,
  Scale,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [popularStocks, setPopularStocks] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMarketData = async () => {
      try {
        const data = await stockService.getMarketOverview();
        setIndices(data.indices || []);
        setPopularStocks((data.allStocks || []).slice(0, 6));
      } catch (err) {
        console.error('Failed to load landing market overview:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadMarketData();
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Banner Ticker (NSE / BSE Indices) */}
      <div className="bg-gray-900/80 border-b border-gray-800 py-2 px-4 overflow-x-auto scrollbar-none font-mono text-xs">
        <div className="flex items-center gap-6 max-w-7xl mx-auto whitespace-nowrap">
          <div className="flex items-center gap-2 font-bold text-gray-400 uppercase text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>INDIAN MARKET INDICES (NSE/BSE):</span>
          </div>
          {indices.map((idx) => {
            const isPos = idx.change >= 0;
            return (
              <div key={idx.name} className="flex items-center gap-2">
                <span className="text-gray-300 font-semibold">{idx.name}</span>
                <span className="text-white font-bold">{idx.value.toLocaleString('en-IN')}</span>
                <span className={`text-[11px] font-semibold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPos ? '+' : ''}{idx.percent.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 px-4 lg:px-8 max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center max-w-3xl mx-auto relative z-10 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Indian Stock Market Real-Time Tracker & Financial Analytics</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6 font-sans">
            Track NSE & BSE Equities, Alerts & Valuation Metrics <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
              In Real-Time
            </span>
          </h1>

          <p className="text-gray-400 text-base sm:text-lg leading-relaxed mb-8">
            Monitor live current prices (CMP), interactive historical charts (1D–5Y), custom threshold price target alerts, multi-stock comparison, and Indian IT, Banking & Energy financial metrics.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-200 flex items-center justify-center transition-colors"
            >
              Sign In to Dashboard
            </Link>
          </div>
        </div>

        {/* Popular Indian Equities Preview */}
        <div className="w-full relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>Popular NSE / BSE Market Stocks</span>
            </h3>
            <Link to="/register" className="text-xs text-blue-400 hover:underline font-semibold">
              Explore All Equities →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularStocks.map((stock) => {
              const isPos = stock.change_val >= 0;
              return (
                <div
                  key={stock.id}
                  className="bg-[#111827] border border-gray-800 rounded-2xl p-4 flex items-center justify-between hover:border-blue-500/40 transition-all shadow-md"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-white text-base">{stock.symbol}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 uppercase font-semibold">
                        {stock.exchange || 'NSE'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 block truncate max-w-[150px]">
                      {stock.company_name}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-white text-base">
                      {formatCurrency(stock.cmp, stock.exchange)}
                    </div>
                    <div
                      className={`inline-flex items-center gap-0.5 text-xs font-semibold font-mono ${
                        isPos ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isPos ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      <span>{formatPercent(stock.change_percent)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-[#070a12] border-t border-gray-800/80 py-8 px-4 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono text-sm text-gray-300 font-bold">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span>StockPulse — Indian Stock Market Platform</span>
          </div>
          <div>Real-Time Research Project (CS456PC) • MGIT Hyderabad</div>
          <div>© {new Date().getFullYear()} StockPulse India. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};
