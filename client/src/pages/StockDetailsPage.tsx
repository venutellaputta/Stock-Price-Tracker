import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { stockService, watchlistService } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { Stock, QuarterlyResult } from '../types';
import { formatCurrency, formatLargeNumber, formatPercent, formatVolume, formatLastUpdatedTime } from '../utils/formatters';
import { StockChart } from '../components/StockChart';
import { AlertModal } from '../components/AlertModal';
import {
  Bookmark,
  Bell,
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Star,
  Sparkles,
  RefreshCw,
  Activity
} from 'lucide-react';

export const StockDetailsPage: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const { liveStocksMap, addToast } = useSocket();

  const [stock, setStock] = useState<Stock | null>(null);
  const [quarterlyResults, setQuarterlyResults] = useState<QuarterlyResult[]>([]);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [currentRange, setCurrentRange] = useState<string>('1Y');
  const [dataMode, setDataMode] = useState<string>('demo');
  const [isChartLoading, setIsChartLoading] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [inWatchlist, setInWatchlist] = useState<boolean>(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);

  const loadStockDetails = async () => {
    if (!symbol) return;
    try {
      setIsLoading(true);
      setError('');
      const res = await stockService.getBySymbol(symbol);
      if (res.success && res.stock) {
        setStock(res.stock);
        if (res.quarterlyResults) setQuarterlyResults(res.quarterlyResults);
        if (res.dataMode) setDataMode(res.dataMode);
      }

      const wl = await watchlistService.getWatchlist();
      if (wl.success) {
        setInWatchlist(wl.watchlist.some((s) => s.symbol.toUpperCase() === symbol.toUpperCase()));
      }
    } catch (err: any) {
      console.error('Error fetching stock details:', err);
      setError(err.response?.data?.message || 'Unable to retrieve live market data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadChartHistory = async (range: string) => {
    if (!symbol) return;
    try {
      setIsChartLoading(true);
      const res = await stockService.getHistory(symbol, range);
      if (res.success) {
        setHistoryData(res.history || []);
      }
    } catch (err) {
      console.error('Error fetching stock history chart:', err);
    } finally {
      setIsChartLoading(false);
    }
  };

  useEffect(() => {
    loadStockDetails();
  }, [symbol]);

  useEffect(() => {
    loadChartHistory(currentRange);
  }, [symbol, currentRange]);

  const handleToggleWatchlist = async () => {
    if (!stock) return;
    try {
      if (inWatchlist) {
        await watchlistService.remove(stock.symbol);
        setInWatchlist(false);
        addToast('Watchlist Updated', `${stock.symbol} removed from your watchlist`, 'info');
      } else {
        await watchlistService.add(stock.symbol);
        setInWatchlist(true);
        addToast('Watchlist Updated', `${stock.symbol} added to your watchlist`, 'success');
      }
    } catch (err: any) {
      addToast('Error', err.response?.data?.message || 'Unable to update watchlist.', 'danger');
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-gray-400">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-sm font-medium">Retrieving Indian stock details for {symbol}...</p>
      </div>
    );
  }

  if (error || !stock) {
    return (
      <div className="bg-[#111827] border border-gray-800 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4">
        <h3 className="text-lg font-bold text-rose-400">Unable to retrieve live market data</h3>
        <p className="text-xs text-gray-400">{error || `Stock symbol '${symbol}' could not be loaded.`}</p>
        <button
          onClick={loadStockDetails}
          className="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white inline-flex items-center gap-2 shadow-lg transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  const activeStock = liveStocksMap[stock.symbol] ? { ...stock, ...liveStocksMap[stock.symbol] } : stock;
  const isPos = activeStock.change_val >= 0;
  const prevClose = activeStock.prev_close || (activeStock.cmp - activeStock.change_val);
  const dayHigh = activeStock.day_high || Math.round(activeStock.cmp * 1.01);
  const dayLow = activeStock.day_low || Math.round(activeStock.cmp * 0.99);

  return (
    <div className="space-y-6">
      {/* Back button Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Back to Dashboard</span>
        </Link>

        <div className="flex items-center gap-3">
          {dataMode === 'live' ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
              <Activity className="w-3.5 h-3.5" />
              LIVE NSE/BSE
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              DEMO DATA
            </span>
          )}

          <button
            onClick={handleToggleWatchlist}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
              inWatchlist
                ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-md'
                : 'bg-gray-900 border-gray-800 text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Star className={`w-4 h-4 ${inWatchlist ? 'fill-current text-blue-400' : ''}`} />
            <span>{inWatchlist ? '★ Remove from Watchlist' : '☆ Add to Watchlist'}</span>
          </button>

          <button
            onClick={() => setIsAlertModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 flex items-center gap-2 transition-all"
          >
            <Bell className="w-4 h-4" />
            <span>Set Price Target Alert</span>
          </button>
        </div>
      </div>

      {/* Main Stock Banner */}
      <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-800/80">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{activeStock.symbol}</h1>
              <span className="text-xs px-2.5 py-0.5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold uppercase">
                {activeStock.exchange || 'NSE'}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-800 text-gray-300 font-semibold">
                {activeStock.sector}
              </span>
            </div>
            <p className="text-sm text-gray-400 font-medium">{activeStock.company_name}</p>
          </div>

          <div className="flex items-end gap-4">
            <div>
              <div className="text-xs text-gray-500 font-medium">Current Market Price (CMP)</div>
              <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
                {formatCurrency(activeStock.cmp, activeStock.exchange)}
              </div>
            </div>

            <div
              className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-sm font-bold font-mono ${
                isPos
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}
            >
              {isPos ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>{isPos ? '+' : ''}₹{activeStock.change_val.toFixed(2)} ({formatPercent(activeStock.change_percent)})</span>
            </div>
          </div>
        </div>

        {/* Detailed Price & Market Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-6 text-xs font-mono">
          <div>
            <span className="text-gray-500 block mb-1">Previous Close</span>
            <span className="font-bold text-white text-sm">₹{prevClose.toFixed(2)}</span>
          </div>

          <div>
            <span className="text-gray-500 block mb-1">Day High / Low</span>
            <span className="font-bold text-white text-sm">
              ₹{dayHigh.toFixed(2)} / ₹{dayLow.toFixed(2)}
            </span>
          </div>

          <div>
            <span className="text-gray-500 block mb-1">52-Week High / Low</span>
            <span className="font-bold text-white text-sm">
              ₹{activeStock.high_52 || 'N/A'} / ₹{activeStock.low_52 || 'N/A'}
            </span>
          </div>

          <div>
            <span className="text-gray-500 block mb-1">Market Cap</span>
            <span className="font-bold text-white text-sm">
              {formatLargeNumber(activeStock.market_cap, activeStock.exchange)}
            </span>
          </div>

          <div>
            <span className="text-gray-500 block mb-1">Stock P/E Ratio</span>
            <span className="font-bold text-white text-sm">
              {activeStock.pe_ratio ? activeStock.pe_ratio.toFixed(2) : 'N/A'}
            </span>
          </div>

          <div>
            <span className="text-gray-500 block mb-1">ROCE %</span>
            <span className="font-bold text-blue-400 text-sm">
              {activeStock.roce !== undefined ? `${activeStock.roce.toFixed(2)}%` : 'N/A'}
            </span>
          </div>

          <div>
            <span className="text-gray-500 block mb-1">Dividend Yield</span>
            <span className="font-bold text-white text-sm">
              {activeStock.div_yield !== undefined ? `${activeStock.div_yield.toFixed(2)}%` : 'N/A'}
            </span>
          </div>

          <div>
            <span className="text-gray-500 block mb-1">Trading Volume</span>
            <span className="font-bold text-white text-sm">
              {formatVolume(activeStock.volume)}
            </span>
          </div>

          <div className="col-span-2">
            <span className="text-gray-500 block mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-400" />
              <span>Last Market Update</span>
            </span>
            <span className="font-bold text-emerald-400 text-xs">
              {formatLastUpdatedTime(activeStock.updated_at)} (NSE Live)
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Stock Price Chart (1D to 5Y) */}
      <StockChart
        data={historyData}
        symbol={activeStock.symbol}
        exchange={activeStock.exchange}
        currentRange={currentRange}
        onRangeChange={(r) => setCurrentRange(r)}
        isLoading={isChartLoading}
      />

      {/* Quarterly Results */}
      {quarterlyResults.length > 0 && (
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white">Quarterly Results Financial Breakdown for {activeStock.symbol} (Ref: Fig 6.4)</h3>
            <p className="text-xs text-gray-400">Consolidated financial figures in Crores INR (Mar 2024 to Mar 2025)</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 bg-gray-900/60 uppercase font-semibold">
                  <th className="py-2.5 px-3">Financial Metric</th>
                  {quarterlyResults.map((q) => (
                    <th key={q.quarter} className="py-2.5 px-3 text-right">{q.quarter}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-gray-300">Sales (Cr) +</td>
                  {quarterlyResults.map((q) => (
                    <td key={q.quarter} className="py-2.5 px-3 text-right font-bold text-white">₹{q.sales.toLocaleString('en-IN')}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-gray-400">Expenses (Cr) +</td>
                  {quarterlyResults.map((q) => (
                    <td key={q.quarter} className="py-2.5 px-3 text-right text-gray-300">₹{q.expenses.toLocaleString('en-IN')}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-blue-400">OPM %</td>
                  {quarterlyResults.map((q) => (
                    <td key={q.quarter} className="py-2.5 px-3 text-right text-blue-400 font-bold">{q.opmPercent}%</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-emerald-400">Net Profit (Cr) +</td>
                  {quarterlyResults.map((q) => (
                    <td key={q.quarter} className="py-2.5 px-3 text-right text-emerald-400 font-bold">₹{q.netProfit.toLocaleString('en-IN')}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-gray-400">EPS in Rs</td>
                  {quarterlyResults.map((q) => (
                    <td key={q.quarter} className="py-2.5 px-3 text-right text-gray-300">₹{q.eps.toFixed(2)}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      <AlertModal
        stock={activeStock}
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
      />
    </div>
  );
};
