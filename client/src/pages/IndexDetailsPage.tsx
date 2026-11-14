import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { indexService } from '../services/api';
import { IndexQuote } from '../types';
import { StockChart } from '../components/StockChart';
import { formatPercent, formatLastUpdatedTime } from '../utils/formatters';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Clock, Sparkles, RefreshCw } from 'lucide-react';

export const IndexDetailsPage: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();

  const [indexData, setIndexData] = useState<IndexQuote | null>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [currentRange, setCurrentRange] = useState<string>('1D');
  const [dataMode, setDataMode] = useState<string>('demo');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isChartLoading, setIsChartLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const loadIndexDetails = async () => {
    if (!symbol) return;
    try {
      setIsLoading(true);
      setError('');
      const res = await indexService.getIndexDetails(symbol);
      if (res.success && res.index) {
        setIndexData(res.index);
        if (res.dataMode) setDataMode(res.dataMode);
      }
    } catch (err: any) {
      console.error('Error fetching index details:', err);
      setError(err.response?.data?.message || 'Unable to retrieve live market data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadChartHistory = async (range: string) => {
    if (!symbol) return;
    try {
      setIsChartLoading(true);
      const res = await indexService.getIndexHistory(symbol, range);
      if (res.success) {
        setHistoryData(res.history || []);
      }
    } catch (err) {
      console.error('Error fetching index history:', err);
    } finally {
      setIsChartLoading(false);
    }
  };

  useEffect(() => {
    loadIndexDetails();
  }, [symbol]);

  useEffect(() => {
    loadChartHistory(currentRange);
  }, [symbol, currentRange]);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-gray-400">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-sm font-medium">Retrieving market index statistics for {symbol}...</p>
      </div>
    );
  }

  if (error || !indexData) {
    return (
      <div className="bg-[#111827] border border-gray-800 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4">
        <h3 className="text-lg font-bold text-rose-400">Unable to retrieve live market data</h3>
        <p className="text-xs text-gray-400">{error || 'Please check your connection and try again.'}</p>
        <button
          onClick={loadIndexDetails}
          className="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white inline-flex items-center gap-2 shadow-lg transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  const isPos = indexData.changeVal >= 0;

  return (
    <div className="space-y-6">
      {/* Back button Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Back to Dashboard</span>
        </Link>

        <div className="flex items-center gap-2">
          {dataMode === 'live' ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              LIVE NSE/BSE
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              DEMO DATA
            </span>
          )}
        </div>
      </div>

      {/* Index Banner Card */}
      <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-800/80">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{indexData.name}</h1>
              <span className="text-xs px-2.5 py-0.5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold uppercase">
                {indexData.exchange}
              </span>
            </div>
            <p className="text-xs text-gray-400 font-medium">Benchmark Indian Market Index</p>
          </div>

          <div className="flex items-end gap-4">
            <div>
              <div className="text-xs text-gray-500 font-medium">Index Value</div>
              <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
                {indexData.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
              <span>{isPos ? '+' : ''}{indexData.changeVal.toFixed(2)} ({formatPercent(indexData.changePercent)})</span>
            </div>
          </div>
        </div>

        {/* Index Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-6 text-xs font-mono">
          <div>
            <span className="text-gray-500 block mb-1">Previous Close</span>
            <span className="font-bold text-white text-sm">
              {indexData.prevClose.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div>
            <span className="text-gray-500 block mb-1">Open</span>
            <span className="font-bold text-white text-sm">
              {indexData.open.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div>
            <span className="text-gray-500 block mb-1">Day High</span>
            <span className="font-bold text-white text-sm">
              {indexData.dayHigh.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div>
            <span className="text-gray-500 block mb-1">Day Low</span>
            <span className="font-bold text-white text-sm">
              {indexData.dayLow.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div>
            <span className="text-gray-500 block mb-1">52-Week High</span>
            <span className="font-bold text-white text-sm">
              {indexData.high52.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div>
            <span className="text-gray-500 block mb-1">52-Week Low</span>
            <span className="font-bold text-white text-sm">
              {indexData.low52.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="col-span-2 mt-2">
            <span className="text-gray-500 block mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-400" />
              <span>Last Market Update</span>
            </span>
            <span className="font-bold text-emerald-400 text-xs">
              {formatLastUpdatedTime(indexData.lastUpdated)} ({indexData.exchange} Live)
            </span>
          </div>
        </div>
      </div>

      {/* Index Interactive Chart */}
      <StockChart
        data={historyData}
        symbol={indexData.name}
        exchange={indexData.exchange}
        currentRange={currentRange}
        onRangeChange={(r) => setCurrentRange(r)}
        isLoading={isChartLoading}
      />
    </div>
  );
};
