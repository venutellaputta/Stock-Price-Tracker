import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { stockService, watchlistService } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { Stock, MarketIndex } from '../types';
import { StockCard } from '../components/StockCard';
import { FinancialMetricsTable } from '../components/FinancialMetricsTable';
import { StockCardSkeleton, TableSkeleton } from '../components/SkeletonLoader';
import {
  Bookmark,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Activity
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { liveStocksMap, addToast } = useSocket();
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [allStocks, setAllStocks] = useState<Stock[]>([]);
  const [gainers, setGainers] = useState<Stock[]>([]);
  const [losers, setLosers] = useState<Stock[]>([]);
  const [trending, setTrending] = useState<Stock[]>([]);
  const [watchlist, setWatchlist] = useState<Stock[]>([]);
  const [marketStatus, setMarketStatus] = useState<string>('OPEN');
  const [dataMode, setDataMode] = useState<string>('demo');
  const [activeTab, setActiveTab] = useState<'gainers' | 'losers' | 'trending'>('gainers');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [overview, wlData] = await Promise.all([
        stockService.getMarketOverview(),
        watchlistService.getWatchlist(),
      ]);

      setIndices(overview.indices || []);
      setAllStocks(overview.allStocks || []);
      setGainers(overview.gainers || []);
      setLosers(overview.losers || []);
      setTrending(overview.trending || []);
      setMarketStatus(overview.marketStatus || 'OPEN');
      if (overview.dataMode) setDataMode(overview.dataMode);
      if (wlData.success) {
        setWatchlist(wlData.watchlist || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleWatchlist = async (symbol: string, currentInWatchlist: boolean) => {
    try {
      if (currentInWatchlist) {
        await watchlistService.remove(symbol);
        setWatchlist((prev) => prev.filter((s) => s.symbol.toUpperCase() !== symbol.toUpperCase()));
        addToast('Removed', `${symbol} removed from watchlist`, 'info');
      } else {
        const res = await watchlistService.add(symbol);
        if (res.success && res.stock) {
          setWatchlist((prev) => [...prev, res.stock]);
          addToast('Added', `${symbol} added to your watchlist`, 'success');
        }
      }
    } catch (err: any) {
      addToast('Error', err.response?.data?.message || 'Watchlist update failed', 'danger');
    }
  };

  const getLiveStock = (stk: Stock): Stock => {
    if (liveStocksMap[stk.symbol]) {
      return { ...stk, ...liveStocksMap[stk.symbol] };
    }
    return stk;
  };

  const getIndexRoute = (idxName: string): string => {
    const clean = idxName.toUpperCase().replace(/\s+/g, '');
    return `/index/${clean}`;
  };

  const currentTabStocks = (activeTab === 'gainers' ? gainers : activeTab === 'losers' ? losers : trending).map(getLiveStock);
  const liveWatchlist = watchlist.map(getLiveStock);
  const liveAllStocks = allStocks.map(getLiveStock);

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111827] border border-gray-800 rounded-2xl p-4 lg:p-6 shadow-xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <span>Indian Stock Market Executive Dashboard</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time NSE / BSE market analytics, streaming equities & key financial valuation metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs">
            <span className="text-gray-400">Market Status:</span>
            <span className="flex items-center gap-1.5 font-bold font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>{marketStatus}</span>
            </span>
          </div>

          {dataMode === 'live' ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
              <Activity className="w-3.5 h-3.5" />
              <span>LIVE NSE/BSE</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>DEMO DATA</span>
            </div>
          )}
        </div>
      </div>

      {/* Part 1 & 2: Clickable Market Index Cards (NIFTY 50, SENSEX, NIFTY BANK, NIFTY IT, NIFTY NEXT 50, NIFTY MIDCAP 100) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {indices.map((idx) => {
          const isPos = idx.change >= 0;
          const route = getIndexRoute(idx.name);
          return (
            <Link
              key={idx.name}
              to={route}
              className="group cursor-pointer bg-[#111827] hover:bg-[#162032] border border-gray-800 hover:border-blue-500/60 rounded-2xl p-3.5 transition-all shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <div className="flex justify-between items-center text-xs font-semibold text-gray-400 mb-1">
                <span className="truncate group-hover:text-blue-400 transition-colors">{idx.name}</span>
                <span className="text-[10px] uppercase text-blue-400 font-bold">{idx.country}</span>
              </div>
              <div className="text-base sm:text-lg font-extrabold font-mono text-white tracking-tight">
                {idx.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div
                className={`inline-flex items-center gap-0.5 text-xs font-semibold font-mono mt-1 ${
                  isPos ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isPos ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                <span>{isPos ? '+' : ''}{idx.percent.toFixed(2)}%</span>
              </div>
              <div className="mt-2 text-[10px] text-blue-400/80 font-medium group-hover:text-blue-400 group-hover:underline flex items-center justify-between">
                <span>View Chart & Stats</span>
                <span>→</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main Grid: Watchlist Preview & Financial Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Watchlist Preview */}
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-blue-400" />
                <span>Your Saved Watchlist Preview</span>
              </h3>
              <Link to="/watchlist" className="text-xs text-blue-400 hover:underline font-mono">
                {liveWatchlist.length} saved — View All →
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <StockCardSkeleton />
                <StockCardSkeleton />
              </div>
            ) : liveWatchlist.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-gray-800 rounded-xl">
                <Bookmark className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-300">Your watchlist is currently empty</p>
                <p className="text-xs text-gray-500 mt-1">Search Indian stocks and click 'Add to Watchlist' to save your favorite equities.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {liveWatchlist.slice(0, 4).map((stk) => (
                  <StockCard
                    key={stk.id}
                    stock={stk}
                    inWatchlist={true}
                    onToggleWatchlist={handleToggleWatchlist}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Financial Metrics Matrix Table (PDF Fig 6.1 - Clickable Rows) */}
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <FinancialMetricsTable stocks={liveAllStocks} />
          )}
        </div>

        {/* Right 1 Col: Gainers/Losers/Trending Tabs (Clickable Stock Cards) */}
        <div className="space-y-6">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4 sm:p-6 shadow-xl">
            <div className="flex items-center gap-1 bg-gray-900 p-1 rounded-xl border border-gray-800 mb-4">
              <button
                onClick={() => setActiveTab('gainers')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'gainers'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Top Gainers
              </button>
              <button
                onClick={() => setActiveTab('losers')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'losers'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Top Losers
              </button>
              <button
                onClick={() => setActiveTab('trending')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'trending'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Trending
              </button>
            </div>

            <div className="divide-y divide-gray-800/60">
              {currentTabStocks.map((stk) => {
                const isPos = stk.change_val >= 0;
                const isInWatchlist = watchlist.some((w) => w.symbol.toUpperCase() === stk.symbol.toUpperCase());
                return (
                  <div key={stk.id} className="py-3 flex items-center justify-between group hover:bg-gray-800/30 px-2 rounded-xl transition-colors">
                    <div
                      onClick={() => navigate(`/stock/${stk.symbol}`)}
                      className="cursor-pointer flex-1"
                    >
                      <div className="font-bold text-sm text-white font-mono flex items-center gap-1.5 group-hover:text-blue-400 transition-colors">
                        <span>{stk.symbol}</span>
                        <span className="text-[10px] text-gray-500 uppercase">{stk.exchange || 'NSE'}</span>
                      </div>
                      <div className="text-xs text-gray-400 truncate max-w-[130px]">{stk.company_name}</div>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <div onClick={() => navigate(`/stock/${stk.symbol}`)} className="cursor-pointer">
                        <div className="font-mono font-bold text-sm text-white">₹{stk.cmp.toLocaleString('en-IN')}</div>
                        <div
                          className={`text-xs font-semibold font-mono ${
                            isPos ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isPos ? '+' : ''}{stk.change_percent.toFixed(2)}%
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleWatchlist(stk.symbol, isInWatchlist)}
                        title={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                        className={`p-1.5 rounded-lg transition-colors border ${
                          isInWatchlist
                            ? 'bg-blue-600/20 border-blue-500/40 text-blue-400'
                            : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                        }`}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isInWatchlist ? 'fill-current text-blue-400' : ''}`} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
