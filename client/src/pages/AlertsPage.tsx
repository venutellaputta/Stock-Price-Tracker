import React, { useEffect, useState } from 'react';
import { alertService } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { Alert } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Bell, Zap, Trash2, ShieldAlert, CheckCircle2, Play, AlertTriangle } from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const { addToast } = useSocket();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'TRIGGERED' | 'DISABLED'>('ALL');

  const fetchAlerts = async () => {
    try {
      setIsLoading(true);
      const res = await alertService.getAlerts();
      if (res.success) {
        setAlerts(res.alerts || []);
      }
    } catch (err) {
      console.error('Failed to fetch price alerts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      await alertService.updateStatus(id, nextStatus);
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: nextStatus } : a))
      );
      addToast('Status Updated', `Alert is now ${nextStatus}`, 'info');
    } catch (err: any) {
      addToast('Error', err.message || 'Failed to update alert', 'danger');
    }
  };

  const handleTestTrigger = async (id: string) => {
    try {
      const res = await alertService.triggerTestAlert(id);
      if (res.success) {
        setAlerts((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: 'TRIGGERED', triggered_at: new Date().toISOString() } : a))
        );
      }
    } catch (err: any) {
      addToast('Error', err.message || 'Failed to trigger test alert', 'danger');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await alertService.delete(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      addToast('Alert Deleted', 'Price alert removed successfully', 'info');
    } catch (err: any) {
      addToast('Error', err.message || 'Failed to delete alert', 'danger');
    }
  };

  const filteredAlerts = alerts.filter((a) =>
    filterStatus === 'ALL' ? true : a.status === filterStatus
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111827] border border-gray-800 rounded-2xl p-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-amber-400" />
            <span>Price Target Alerts Engine</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Background threshold monitoring with instant in-app WebSocket notifications
          </p>
        </div>

        <div className="flex items-center gap-2 bg-gray-900 p-1 rounded-xl border border-gray-800 self-start sm:self-auto">
          {(['ALL', 'ACTIVE', 'TRIGGERED', 'DISABLED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterStatus === st
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-gray-400 text-sm">Loading price alerts...</div>
      ) : filteredAlerts.length === 0 ? (
        <div className="bg-[#111827] border border-gray-800 rounded-3xl p-12 text-center max-w-lg mx-auto">
          <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Alerts Found</h3>
          <p className="text-xs text-gray-400">
            No price alerts match the selected filter. Set alerts directly from any stock details page.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAlerts.map((alert) => {
            const stock = alert.stock;
            const isTriggered = alert.status === 'TRIGGERED';
            const isActive = alert.status === 'ACTIVE';

            return (
              <div
                key={alert.id}
                className={`bg-[#111827] border rounded-2xl p-5 transition-all shadow-lg relative ${
                  isTriggered
                    ? 'border-amber-500/50 bg-amber-500/5'
                    : isActive
                    ? 'border-emerald-500/30'
                    : 'border-gray-800 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-white font-mono">{stock?.symbol || 'STOCK'}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          isTriggered
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : isActive
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {alert.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{stock?.company_name}</p>
                  </div>

                  {/* Trigger test button required by prompt */}
                  <button
                    onClick={() => handleTestTrigger(alert.id)}
                    title="Simulate Trigger for Presentation Demo"
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold flex items-center gap-1 transition-all"
                  >
                    <Play className="w-3 h-3" />
                    <span>Test Trigger</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800/80 flex items-center justify-between text-xs font-mono my-3">
                  <div>
                    <span className="text-gray-500 block">Alert Condition</span>
                    <span className="font-bold text-white text-sm">
                      Price {alert.condition} ₹{alert.target_price}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-500 block">Current CMP</span>
                    <span className="font-bold text-white text-sm">
                      {stock ? formatCurrency(stock.cmp, stock.exchange) : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 text-xs border-t border-gray-800/50">
                  <span className="text-gray-500 font-mono">
                    {isTriggered
                      ? `Triggered at: ${formatDate(alert.triggered_at)}`
                      : `Created: ${formatDate(alert.created_at)}`}
                  </span>

                  <div className="flex items-center gap-2">
                    {alert.status !== 'TRIGGERED' && (
                      <button
                        onClick={() => handleToggleStatus(alert.id, alert.status)}
                        className="text-gray-400 hover:text-white font-medium text-xs underline"
                      >
                        {isActive ? 'Disable' : 'Enable'}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(alert.id)}
                      className="text-rose-400 hover:text-rose-300 p-1"
                      title="Delete Alert"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
