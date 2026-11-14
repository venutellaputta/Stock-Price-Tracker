import React from 'react';
import { Link } from 'react-router-dom';
import { Stock } from '../types';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { ArrowUpRight, ArrowDownRight, Bookmark, Check, TrendingUp, TrendingDown } from 'lucide-react';

interface StockCardProps {
  stock: Stock;
  inWatchlist?: boolean;
  onToggleWatchlist?: (symbol: string, currentInWatchlist: boolean) => void;
  showWatchlistRemove?: boolean;
  onRemoveWatchlist?: (symbol: string) => void;
}

export const StockCard: React.FC<StockCardProps> = ({
  stock,
  inWatchlist = false,
  onToggleWatchlist,
  showWatchlistRemove = false,
  onRemoveWatchlist,
}) => {
  const isPositive = stock.change_val >= 0;

  // Generate mini sparkline datapoints for visual trend indicator
  const sparklineData = Array.from({ length: 8 }, (_, i) => {
    const factor = isPositive ? (1 + (i / 8) * 0.02 + Math.sin(i) * 0.005) : (1 - (i / 8) * 0.02 + Math.cos(i) * 0.005);
    return Math.round(stock.cmp * factor);
  });

  const minP = Math.min(...sparklineData);
  const maxP = Math.max(...sparklineData);
  const rangeP = maxP - minP || 1;

  // Normalize points into SVG Polyline format (100x30 coordinate box)
  const sparklinePoints = sparklineData
    .map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * 100;
      const y = 28 - ((val - minP) / rangeP) * 24;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="group relative bg-[#111827] hover:bg-[#162032] border border-gray-800 hover:border-gray-700/80 rounded-2xl p-4 transition-all duration-200 shadow-md hover:shadow-xl">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="flex items-center gap-2">
            <Link
              to={`/stock/${stock.symbol}`}
              className="font-bold text-lg text-white group-hover:text-blue-400 font-mono transition-colors"
            >
              {stock.symbol}
            </Link>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 font-semibold uppercase">
              {stock.exchange || 'NSE'}
            </span>
          </div>
          <p className="text-xs text-gray-400 truncate max-w-[170px]" title={stock.company_name}>
            {stock.company_name}
          </p>
        </div>

        {/* Watchlist Toggle / Remove Button */}
        {showWatchlistRemove && onRemoveWatchlist ? (
          <button
            onClick={() => onRemoveWatchlist(stock.symbol)}
            title="Remove from Watchlist"
            className="p-1.5 rounded-lg bg-gray-800/80 hover:bg-rose-500/20 text-rose-400 transition-colors"
          >
            <Bookmark className="w-4 h-4 fill-current text-rose-400" />
          </button>
        ) : onToggleWatchlist ? (
          <button
            onClick={() => onToggleWatchlist(stock.symbol, inWatchlist)}
            title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            className={`p-1.5 rounded-lg transition-colors border ${
              inWatchlist
                ? 'bg-blue-600/20 border-blue-500/40 text-blue-400'
                : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${inWatchlist ? 'fill-current text-blue-400' : ''}`} />
          </button>
        ) : (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {stock.sector}
          </span>
        )}
      </div>

      {/* Mini Sparkline Price Trend Chart */}
      <div className="my-2 h-8 w-full flex items-center justify-between">
        <svg className="w-full h-7 overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke={isPositive ? '#10B981' : '#EF4444'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={sparklinePoints}
          />
        </svg>
      </div>

      <div className="flex items-end justify-between mt-2 pt-2 border-t border-gray-800/50">
        <div>
          <div className="text-[11px] text-gray-500 font-medium">CMP</div>
          <div className="text-lg font-bold font-mono text-white tracking-tight">
            {formatCurrency(stock.cmp, stock.exchange)}
          </div>
        </div>

        <div className="text-right">
          <div
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold font-mono ${
              isPositive
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}
          >
            {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            <span>{formatPercent(stock.change_percent)}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <Link
          to={`/stock/${stock.symbol}`}
          className="text-gray-400 hover:text-blue-400 font-medium transition-colors"
        >
          View Chart & Financials →
        </Link>
      </div>
    </div>
  );
};
