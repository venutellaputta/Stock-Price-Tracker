import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { formatCurrency } from '../utils/formatters';

interface ChartPoint {
  timestamp: string;
  label: string;
  price: number;
  volume: number;
}

interface StockChartProps {
  data: ChartPoint[];
  symbol: string;
  exchange?: string;
  currentRange: string;
  onRangeChange: (range: string) => void;
  isLoading?: boolean;
}

export const StockChart: React.FC<StockChartProps> = ({
  data,
  symbol,
  exchange = 'NSE',
  currentRange,
  onRangeChange,
  isLoading
}) => {
  const ranges = ['1D', '1W', '1M', '3M', '6M', '1Y', '5Y'];

  const firstPrice = data.length > 0 ? data[0].price : 0;
  const lastPrice = data.length > 0 ? data[data.length - 1].price : 0;
  const isPositive = lastPrice >= firstPrice;

  const strokeColor = isPositive ? '#10B981' : '#EF4444';

  const prices = data.map((d) => d.price).filter((p) => typeof p === 'number' && !isNaN(p));
  const minPrice = Math.floor((Math.min(...prices) || 100) * 0.98);
  const maxPrice = Math.ceil((Math.max(...prices) || 200) * 1.02);

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4 lg:p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Historical Price Chart ({symbol})</span>
            {isLoading && <span className="text-xs text-blue-400 animate-pulse">Updating...</span>}
          </h3>
          <p className="text-xs text-gray-400">Interactive timeframe analysis for {exchange} equity</p>
        </div>

        {/* Timeframe controls */}
        <div className="flex items-center gap-1 bg-gray-900/90 p-1 rounded-xl border border-gray-800 self-start sm:self-auto">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => onRangeChange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
                currentRange === r
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-72 sm:h-80 lg:h-96">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
            Fetching chart data for {symbol}...
          </div>
        ) : data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
            No price history available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              
              <XAxis
                dataKey="label"
                stroke="#6B7280"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                minTickGap={20}
              />
              
              <YAxis
                stroke="#6B7280"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={[minPrice, maxPrice]}
                tickFormatter={(val) => `₹${val}`}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const dataPoint = payload[0].payload;
                    return (
                      <div className="bg-[#0b0f19] border border-gray-700 p-3 rounded-xl shadow-2xl font-mono text-xs">
                        <div className="text-gray-400 mb-1">Time/Date: {dataPoint.label}</div>
                        <div className="text-white font-bold text-sm">
                          CMP: {formatCurrency(dataPoint.price, exchange)}
                        </div>
                        {dataPoint.volume && (
                          <div className="text-gray-400 text-[11px] mt-0.5">
                            Volume: {dataPoint.volume.toLocaleString('en-IN')}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Area
                type="monotone"
                dataKey="price"
                stroke={strokeColor}
                strokeWidth={2.5}
                fill="url(#priceGradient)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
