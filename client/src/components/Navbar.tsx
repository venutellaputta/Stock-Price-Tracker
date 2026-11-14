import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { stockService } from '../services/api';
import { Stock } from '../types';
import { formatCurrency, formatPercent } from '../utils/formatters';
import {
  TrendingUp,
  Search,
  LogOut,
  Sparkles,
  Activity,
  X
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isConnected } = useSocket();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [dataMode, setDataMode] = useState<'live' | 'demo'>('demo');
  const [isLive, setIsLive] = useState<boolean>(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchOverviewStatus = async () => {
      try {
        const res = await stockService.getMarketOverview();
        if (res.dataMode) setDataMode(res.dataMode);
        if (res.isLive !== undefined) setIsLive(res.isLive);
      } catch (err) {
        console.error('Navbar status fetch error:', err);
      }
    };
    fetchOverviewStatus();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.trim().length >= 1) {
        setIsSearching(true);
        try {
          const res = await stockService.search(searchQuery.trim());
          if (res.success) {
            setSearchResults(res.stocks);
            setShowResultsModal(true);
          }
        } catch (err) {
          console.error('Search error:', err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResultsModal(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResultsModal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectStock = (symbol: string) => {
    setShowResultsModal(false);
    setSearchQuery('');
    const cleanSym = symbol.replace(/^['"]+|['"]+$/g, '').replace(/['"]/g, '');
    navigate(`/stock/${cleanSym}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0d1322]/90 backdrop-blur-md border-b border-gray-800/80 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white font-mono">
                  Stock<span className="text-blue-500">Pulse</span>
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400 block -mt-1">
                Indian Market (NSE / BSE)
              </span>
            </div>
          </Link>

          {/* Mode Badge based on backend response */}
          {dataMode === 'live' && isLive ? (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
              <Activity className="w-3.5 h-3.5" />
              <span>LIVE NSE/BSE</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{dataMode === 'live' ? 'LIVE DATA UNAVAILABLE' : 'DEMO DATA'}</span>
            </div>
          )}
        </div>

        {/* Global Search Box (Indian Stocks Only) */}
        <div className="flex-1 max-w-md relative" ref={searchRef}>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Indian stocks e.g. TCS, INFY, RELIANCE, HDFCBANK..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setShowResultsModal(true)}
              className="w-full bg-gray-900/90 border border-gray-800 rounded-xl pl-10 pr-9 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Autocomplete Modal */}
          {showResultsModal && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-[#111827] border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
              <div className="p-2 border-b border-gray-800/60 text-xs font-semibold text-gray-400 flex justify-between items-center">
                <span>Matching Indian Equities</span>
                <span>{searchResults.length} found</span>
              </div>
              {isSearching ? (
                <div className="p-4 text-center text-sm text-gray-400">Searching NSE / BSE symbols...</div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-400">No Indian stocks found for "{searchQuery}"</div>
              ) : (
                <div className="divide-y divide-gray-800/40">
                  {searchResults.map((stk) => (
                    <button
                      key={stk.id}
                      onClick={() => handleSelectStock(stk.symbol)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-800/60 flex items-center justify-between transition-colors group"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-mono text-sm text-white group-hover:text-blue-400 transition-colors">
                            {stk.symbol}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 uppercase font-semibold">
                            {stk.exchange || 'NSE'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 truncate max-w-[220px]">{stk.company_name}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm font-semibold text-white">
                          {formatCurrency(stk.cmp, stk.exchange)}
                        </div>
                        <div
                          className={`text-xs font-medium font-mono ${
                            stk.change_val >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {formatPercent(stk.change_percent)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Nav Options */}
        <div className="flex items-center gap-3">
          <div
            title={isConnected ? 'Real-time WebSocket Stream Active' : 'WebSocket Reconnecting...'}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-900 border border-gray-800 text-xs text-gray-400"
          >
            {isConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-400 font-medium text-[11px]">LIVE NSE/BSE</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-rose-400 font-medium text-[11px]">OFFLINE</span>
              </>
            )}
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-sm font-medium text-gray-200 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-xs">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <span className="hidden md:inline font-medium text-xs">{user?.name}</span>
              </Link>
              <button
                onClick={logout}
                title="Log Out"
                className="p-2 rounded-xl bg-gray-900 hover:bg-rose-500/20 hover:text-rose-400 border border-gray-800 text-gray-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-xl text-sm font-semibold text-gray-300 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
