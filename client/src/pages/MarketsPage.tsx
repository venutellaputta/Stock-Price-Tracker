import React, { useEffect, useState } from 'react';
import { stockService } from '../services/api';
import { SectorSummary, Stock } from '../types';
import { StockCard } from '../components/StockCard';
import { PieChart, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';

export const MarketsPage: React.FC = () => {
  const [sectors, setSectors] = useState<SectorSummary[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [allStocks, setAllStocks] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMarketData = async () => {
      try {
        const data = await stockService.getMarketOverview();
        setSectors(data.sectors || []);
        setAllStocks(data.allStocks || []);
      } catch (err) {
        console.error('Failed to fetch sectors:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadMarketData();
  }, []);

  const filteredStocks = selectedSector === 'ALL'
    ? allStocks
    : allStocks.filter((s) => s.sector.toUpperCase() === selectedSector.toUpperCase());

  return (
    <div className="space-y-6">
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
        <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
          <PieChart className="w-6 h-6 text-blue-400" />
          <span>Market Sectors & Industry Analytics</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Sectoral performance breakdown across IT, Banking, Energy, Tech, and Automobile
        </p>
      </div>

      {/* Sector Summary Performance Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <button
          onClick={() => setSelectedSector('ALL')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedSector === 'ALL'
              ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg'
              : 'bg-[#111827] border-gray-800 text-gray-400 hover:border-gray-700'
          }`}
        >
          <div className="text-xs font-bold uppercase tracking-wider mb-1">ALL SECTORS</div>
          <div className="text-lg font-extrabold text-white font-mono">{allStocks.length} Stocks</div>
        </button>

        {sectors.map((sec) => {
          const isPos = sec.avg_change >= 0;
          const isSelected = selectedSector === sec.sector;

          return (
            <button
              key={sec.sector}
              onClick={() => setSelectedSector(sec.sector)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg'
                  : 'bg-[#111827] border-gray-800 text-gray-400 hover:border-gray-700'
              }`}
            >
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider mb-1">
                <span>{sec.sector}</span>
                <span className="text-[10px] text-gray-500">{sec.count} stocks</span>
              </div>
              <div
                className={`inline-flex items-center gap-0.5 text-base font-extrabold font-mono ${
                  isPos ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isPos ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span>{isPos ? '+' : ''}{sec.avg_change.toFixed(2)}%</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Sector Stock List */}
      <div>
        <h3 className="font-bold text-base text-white mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-400" />
          <span>{selectedSector === 'ALL' ? 'All Market Equities' : `${selectedSector} Sector Equities`}</span>
        </h3>

        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-400">Loading market equities...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStocks.map((stk) => (
              <StockCard key={stk.id} stock={stk} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
