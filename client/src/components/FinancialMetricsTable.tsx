import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Stock } from '../types';
import { formatCurrency, formatLargeNumber, formatPercent } from '../utils/formatters';

interface FinancialMetricsTableProps {
  stocks: Stock[];
  title?: string;
}

export const FinancialMetricsTable: React.FC<FinancialMetricsTableProps> = ({
  stocks,
  title = 'Indian IT & Major Equities Financial Performance Matrix (Ref: Fig 6.1)',
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4 lg:p-6 shadow-xl overflow-hidden">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-white">{title}</h3>
          <p className="text-xs text-gray-400">
            Click any stock row to open its detailed interactive chart, financials & valuation profile
          </p>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left text-xs font-mono border-collapse">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 bg-gray-900/60 uppercase font-semibold">
              <th className="py-3 px-3">S.No</th>
              <th className="py-3 px-3">Name / Symbol</th>
              <th className="py-3 px-3 text-right">CMP (₹)</th>
              <th className="py-3 px-3 text-right">P/E</th>
              <th className="py-3 px-3 text-right">Mar Cap (Cr)</th>
              <th className="py-3 px-3 text-right">Div Yield %</th>
              <th className="py-3 px-3 text-right">NP Qtr (Cr)</th>
              <th className="py-3 px-3 text-right">Qtr Profit Var %</th>
              <th className="py-3 px-3 text-right">Qtr Sales Var %</th>
              <th className="py-3 px-3 text-right">ROCE %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {stocks.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-6 text-center text-gray-500 font-sans">
                  No stock data available.
                </td>
              </tr>
            ) : (
              stocks.map((s, idx) => {
                const isProfitPos = (s.profit_var || 0) >= 0;
                return (
                  <tr
                    key={s.id}
                    onClick={() => navigate(`/stock/${s.symbol}`)}
                    className="cursor-pointer hover:bg-blue-600/10 hover:border-l-4 hover:border-l-blue-500 transition-all group"
                  >
                    <td className="py-3 px-3 text-gray-500">{idx + 1}</td>
                    <td className="py-3 px-3 font-sans">
                      <div className="font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                        <span className="font-mono text-sm">{s.symbol}</span>
                        <span className="text-[10px] text-gray-400 font-mono font-normal truncate max-w-[140px]">
                          ({s.company_name})
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-white">
                      {formatCurrency(s.cmp, s.exchange)}
                    </td>
                    <td className="py-3 px-3 text-right text-gray-300">
                      {s.pe_ratio ? s.pe_ratio.toFixed(2) : 'N/A'}
                    </td>
                    <td className="py-3 px-3 text-right text-gray-300 font-semibold">
                      {formatLargeNumber(s.market_cap, s.exchange)}
                    </td>
                    <td className="py-3 px-3 text-right text-gray-300">
                      {s.div_yield !== undefined ? `${s.div_yield.toFixed(2)}%` : 'N/A'}
                    </td>
                    <td className="py-3 px-3 text-right text-gray-200 font-semibold">
                      {s.qtr_profit ? `₹${s.qtr_profit.toLocaleString('en-IN')}` : 'N/A'}
                    </td>
                    <td
                      className={`py-3 px-3 text-right font-semibold ${
                        isProfitPos ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {formatPercent(s.profit_var)}
                    </td>
                    <td className="py-3 px-3 text-right text-gray-300">
                      {formatPercent(s.sales_var)}
                    </td>
                    <td className="py-3 px-3 text-right text-blue-400 font-bold">
                      {s.roce !== undefined ? `${s.roce.toFixed(2)}%` : 'N/A'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
