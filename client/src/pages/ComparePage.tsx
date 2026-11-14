import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { compareService, stockService } from '../services/api';
import { Stock } from '../types';
import { formatCurrency, formatLargeNumber, formatPercent } from '../utils/formatters';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { Scale, Plus, X, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const COLOR_PALETTE = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899'];

export const ComparePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(['TCS', 'INFY']);
  const [comparedStocks, setComparedStocks] = useState<Stock[]>([]);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [availableStocks, setAvailableStocks] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [addStockSymbol, setAddStockSymbol] = useState<string>('');

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const res = await stockService.getMarketOverview();
        if (res.allStocks) setAvailableStocks(res.allStocks);
      } catch (err) {
        console.error('Failed to fetch available stocks for comparison:', err);
      }
    };
    loadOverview();
  }, []);

  const loadComparison = async (symbols: string[]) => {
    if (symbols.length === 0) return;
    try {
      setIsLoading(true);
      const res = await compareService.compare(symbols);
      if (res.success) {
        setComparedStocks(res.stocks || []);
        setHistoryData(res.history || []);
      }
    } catch (err) {
      console.error('Failed to run comparison:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComparison(selectedSymbols);
  }, [selectedSymbols]);

  const handleAddStock = () => {
    if (!addStockSymbol.trim()) return;
    const sym = addStockSymbol.trim().toUpperCase();
    if (!selectedSymbols.includes(sym) && selectedSymbols.length < 4) {
      setSelectedSymbols([...selectedSymbols, sym]);
      setAddStockSymbol('');
    }
  };

  const handleRemoveStock = (sym: string) => {
    if (selectedSymbols.length <= 2) return;
    setSelectedSymbols(selectedSymbols.filter((s) => s.toUpperCase() !== sym.toUpperCase()));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111827] border border-gray-800 rounded-2xl p-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <Scale className="w-6 h-6 text-blue-400" />
            <span>Multi-Stock Comparison Matrix</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Compare 2 to 4 Indian market equities side-by-side with historical price overlay
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={addStockSymbol}
            onChange={(e) => setAddStockSymbol(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">+ Add Indian Stock to Compare...</option>
            {availableStocks
              .filter((s) => !selectedSymbols.includes(s.symbol))
              .map((s) => (
                <option key={s.id} value={s.symbol}>
                  {s.symbol} ({s.company_name})
                </option>
              ))}
          </select>
          <button
            onClick={handleAddStock}
            disabled={!addStockSymbol || selectedSymbols.length >= 4}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all"
          >
            Add
          </button>
        </div>
      </div>

      {/* Selected Stock Badges */}
      <div className="flex flex-wrap gap-3">
        {selectedSymbols.map((sym, idx) => (
          <div
            key={sym}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border bg-gray-900 text-xs font-mono font-bold"
            style={{ borderColor: COLOR_PALETTE[idx % COLOR_PALETTE.length], color: COLOR_PALETTE[idx % COLOR_PALETTE.length] }}
          >
            <span
              onClick={() => navigate(`/stock/${sym}`)}
              className="cursor-pointer hover:underline"
            >
              {sym} →
            </span>
            {selectedSymbols.length > 2 && (
              <button onClick={() => handleRemoveStock(sym)} className="hover:text-rose-400 ml-1">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Overlay Chart */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-4">Historical Relative Price Trend (%)</h3>
        <div className="w-full h-80">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">Loading comparison chart...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="date" stroke="#6B7280" fontSize={11} />
                <YAxis stroke="#6B7280" fontSize={11} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#0b0f19] border border-gray-700 p-3 rounded-xl shadow-2xl font-mono text-xs space-y-1">
                          <div className="text-gray-400">Date: {label}</div>
                          {payload.map((p: any) => (
                            <div key={p.name} style={{ color: p.color }} className="font-bold">
                              {p.name}: ₹{p.value?.toLocaleString('en-IN')}
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                {comparedStocks.map((stk, idx) => (
                  <Line
                    key={stk.symbol}
                    type="monotone"
                    dataKey={stk.symbol}
                    name={stk.symbol}
                    stroke={COLOR_PALETTE[idx % COLOR_PALETTE.length]}
                    strokeWidth={2.5}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Comparison Metrics Table (Clickable Headers & Stock Rows) */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl overflow-x-auto">
        <h3 className="text-base font-bold text-white mb-4">Side-by-Side Financial Valuation Matrix</h3>
        <table className="w-full text-left text-xs font-mono border-collapse">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 bg-gray-900/60 uppercase">
              <th className="py-3 px-3">Metric</th>
              {comparedStocks.map((stk) => (
                <th
                  key={stk.symbol}
                  onClick={() => navigate(`/stock/${stk.symbol}`)}
                  className="py-3 px-3 cursor-pointer hover:text-blue-400 transition-colors text-right"
                >
                  <span className="font-bold text-white text-sm">{stk.symbol}</span>
                  <span className="block text-[10px] text-gray-500 font-normal truncate max-w-[120px]">{stk.company_name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            <tr>
              <td className="py-3 px-3 font-semibold text-gray-300">CMP (₹)</td>
              {comparedStocks.map((stk) => (
                <td key={stk.symbol} className="py-3 px-3 text-right font-bold text-white">
                  {formatCurrency(stk.cmp, stk.exchange)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3 px-3 font-semibold text-gray-400">Daily Change %</td>
              {comparedStocks.map((stk) => (
                <td
                  key={stk.symbol}
                  className={`py-3 px-3 text-right font-bold ${stk.change_val >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
                >
                  {formatPercent(stk.change_percent)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3 px-3 font-semibold text-gray-400">Market Cap (Cr)</td>
              {comparedStocks.map((stk) => (
                <td key={stk.symbol} className="py-3 px-3 text-right text-gray-300 font-semibold">
                  {formatLargeNumber(stk.market_cap, stk.exchange)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3 px-3 font-semibold text-gray-400">P/E Ratio</td>
              {comparedStocks.map((stk) => (
                <td key={stk.symbol} className="py-3 px-3 text-right text-gray-300">
                  {stk.pe_ratio ? stk.pe_ratio.toFixed(2) : 'N/A'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3 px-3 font-semibold text-gray-400">ROCE %</td>
              {comparedStocks.map((stk) => (
                <td key={stk.symbol} className="py-3 px-3 text-right text-blue-400 font-bold">
                  {stk.roce !== undefined ? `${stk.roce.toFixed(2)}%` : 'N/A'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3 px-3 font-semibold text-gray-400">Dividend Yield %</td>
              {comparedStocks.map((stk) => (
                <td key={stk.symbol} className="py-3 px-3 text-right text-gray-300">
                  {stk.div_yield !== undefined ? `${stk.div_yield.toFixed(2)}%` : 'N/A'}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
