import React, { useState } from 'react';
import { Stock } from '../types';
import { alertService } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { X, Bell, ShieldAlert } from 'lucide-react';

interface AlertModalProps {
  stock: Stock;
  isOpen: boolean;
  onClose: () => void;
  onAlertCreated?: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({ stock, isOpen, onClose, onAlertCreated }) => {
  const { addToast } = useSocket();
  const [condition, setCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [targetPrice, setTargetPrice] = useState<string>(stock.cmp ? stock.cmp.toString() : '1000');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceVal = parseFloat(targetPrice);

    if (isNaN(priceVal) || priceVal <= 0) {
      setError('Please enter a valid target price greater than 0.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await alertService.create(stock.symbol, condition, priceVal);
      if (res.success) {
        addToast(
          'Alert Created',
          `Price alert set for ${stock.symbol} when price is ${condition} ₹${priceVal}`,
          'success'
        );
        if (onAlertCreated) onAlertCreated();
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create price alert.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Create Price Alert</h3>
            <p className="text-xs text-gray-400">Set custom trigger condition for {stock.symbol}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Target Stock</label>
            <div className="p-3 rounded-xl bg-gray-900 border border-gray-800 flex justify-between items-center">
              <div>
                <span className="font-mono font-bold text-white text-sm">{stock.symbol}</span>
                <span className="text-xs text-gray-400 block truncate">{stock.company_name}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400 block">Current Price</span>
                <span className="font-mono font-bold text-white text-sm">₹{stock.cmp}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Alert Condition</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCondition('ABOVE')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold font-mono transition-all border ${
                  condition === 'ABOVE'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/10'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-800'
                }`}
              >
                Price Goes ABOVE ↑
              </button>
              <button
                type="button"
                onClick={() => setCondition('BELOW')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold font-mono transition-all border ${
                  condition === 'BELOW'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-md shadow-rose-500/10'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-800'
                }`}
              >
                Price Goes BELOW ↓
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Target Price (₹)</label>
            <input
              type="number"
              step="0.01"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder="e.g. 1800.00"
              required
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 font-mono text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Setting Alert...' : 'Set Price Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
