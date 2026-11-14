import React from 'react';
import { useSocket } from '../context/SocketContext';
import { Bell, CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';

export const ToastNotificationContainer: React.FC = () => {
  const { toasts, dismissToast } = useSocket();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isDanger = toast.type === 'danger' || toast.type === 'warning';
        const isSuccess = toast.type === 'success';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl backdrop-blur-md flex items-start gap-3 transition-all animate-bounce-in ${
              isDanger
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-100 shadow-rose-900/30'
                : isSuccess
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-100 shadow-emerald-900/30'
                : 'bg-blue-950/90 border-blue-500/50 text-blue-100 shadow-blue-900/30'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {isDanger ? (
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              ) : isSuccess ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <Bell className="w-5 h-5 text-blue-400" />
              )}
            </div>

            <div className="flex-1 pr-2">
              <h4 className="font-bold text-xs uppercase tracking-wider font-mono">{toast.title}</h4>
              <p className="text-xs mt-0.5 opacity-90 leading-relaxed">{toast.message}</p>
            </div>

            <button
              onClick={() => dismissToast(toast.id)}
              className="text-gray-400 hover:text-white p-1 rounded hover:bg-black/20"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
