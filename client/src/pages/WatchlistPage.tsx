import React, { useEffect, useState } from 'react';
import { watchlistService } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { Stock } from '../types';
import { StockCard } from '../components/StockCard';
import { StockCardSkeleton } from '../components/SkeletonLoader';
import { Bookmark, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const WatchlistPage: React.FC = () => {
  const { liveStocksMap, addToast } = useSocket();
  const [watchlist, setWatchlist] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchWatchlist = async () => {
    try {
      setIsLoading(true);
      const res = await watchlistService.getWatchlist();
      if (res.success) {
        setWatchlist(res.watchlist || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch watchlist:', err);
      addToast('Error', err.response?.data?.message || 'Unable to update watchlist. Please try again.', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const handleRemove = async (symbol: string) => {
    try {
      await watchlistService.remove(symbol);
      setWatchlist((prev) => prev.filter((s) => s.symbol.toUpperCase() !== symbol.toUpperCase()));
      addToast('Watchlist Updated', `${symbol} removed from your watchlist`, 'info');
    } catch (err: any) {
      addToast('Error', err.response?.data?.message || 'Unable to update watchlist. Please try again.', 'danger');
    }
  };

  // Overlay live WebSocket ticks onto watchlist
  const liveWatchlist = watchlist.map((stk) =>
    liveStocksMap[stk.symbol] ? { ...stk, ...liveStocksMap[stk.symbol] } : stk
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111827] border border-gray-800 rounded-2xl p-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-blue-500" />
            <span>Personalized Indian Stock Watchlist</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Persisted monitoring list with live streaming ticks & mini price sparklines
          </p>
        </div>

        <Link
          to="/dashboard"
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 shadow-lg shadow-blue-600/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add More Equities</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StockCardSkeleton />
          <StockCardSkeleton />
          <StockCardSkeleton />
        </div>
      ) : liveWatchlist.length === 0 ? (
        <div className="bg-[#111827] border border-gray-800 rounded-3xl p-12 text-center max-w-lg mx-auto">
          <Bookmark className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">Your Watchlist is Empty</h3>
          <p className="text-xs text-gray-400 mb-6">
            You haven't saved any Indian stocks to your watchlist yet. Search stocks (e.g. TCS, INFY, RELIANCE) and click 'Add to Watchlist'.
          </p>
          <Link
            to="/dashboard"
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition-all inline-block"
          >
            Explore NSE / BSE Equities
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {liveWatchlist.map((stk) => (
            <StockCard
              key={stk.id}
              stock={stk}
              showWatchlistRemove={true}
              onRemoveWatchlist={handleRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
};
