import React, { createContext, useContext, useEffect, useState } from 'react';
import { Stock, Alert } from '../types';

interface ToastAlert {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
}

interface SocketContextType {
  isConnected: boolean;
  liveStocksMap: Record<string, Stock>;
  toasts: ToastAlert[];
  dismissToast: (id: string) => void;
  addToast: (title: string, message: string, type?: ToastAlert['type']) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [liveStocksMap, setLiveStocksMap] = useState<Record<string, Stock>>({});
  const [toasts, setToasts] = useState<ToastAlert[]>([]);

  const addToast = (title: string, message: string, type: ToastAlert['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);

    // Auto dismiss after 6 seconds
    setTimeout(() => {
      dismissToast(id);
    }, 6000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    let socket: WebSocket | null = null;
    let reconnectTimer: any = null;

    const connect = () => {
      try {
        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
          setIsConnected(true);
        };

        socket.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'STOCK_UPDATE' && Array.isArray(msg.data)) {
              const updatedMap: Record<string, Stock> = {};
              msg.data.forEach((s: Stock) => {
                updatedMap[s.symbol] = s;
              });
              setLiveStocksMap((prev) => ({ ...prev, ...updatedMap }));
            } else if (msg.type === 'ALERTS_TRIGGERED' && Array.isArray(msg.data)) {
              msg.data.forEach((alert: Alert) => {
                const stockName = alert.stock?.symbol || 'Stock';
                addToast(
                  '🚨 PRICE ALERT TRIGGERED',
                  `Price target met for ${stockName}! Condition: ${alert.condition} ₹${alert.target_price}`,
                  'warning'
                );
              });
            }
          } catch (e) {
            console.error('Error parsing WebSocket message:', e);
          }
        };

        socket.onclose = () => {
          setIsConnected(false);
          // Try reconnecting after 4 seconds
          reconnectTimer = setTimeout(connect, 4000);
        };

        socket.onerror = () => {
          setIsConnected(false);
        };
      } catch (err) {
        console.error('WebSocket connection error:', err);
      }
    };

    connect();

    return () => {
      if (socket) socket.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        liveStocksMap,
        toasts,
        dismissToast,
        addToast,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
