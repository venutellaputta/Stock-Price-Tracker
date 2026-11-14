import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bookmark,
  TrendingUp,
  Bell,
  Scale,
  Newspaper,
  User,
  PieChart
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Watchlist', path: '/watchlist', icon: Bookmark },
    { label: 'Markets / Sectors', path: '/markets', icon: PieChart },
    { label: 'Price Alerts', path: '/alerts', icon: Bell },
    { label: 'Stock Compare', path: '/compare', icon: Scale },
    { label: 'Financial News', path: '/news', icon: Newspaper },
    { label: 'User Profile', path: '/profile', icon: User },
  ];

  return (
    <aside className="w-full md:w-64 bg-[#0d1322]/60 border-r border-gray-800/80 p-4 flex md:flex-col justify-between shrink-0">
      <div className="w-full">
        <div className="hidden md:block mb-4 px-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">
          Navigation Menu
        </div>
        <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-500/10 font-semibold'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="hidden md:block p-3.5 rounded-xl bg-gradient-to-br from-blue-900/20 to-indigo-900/10 border border-blue-500/20">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold text-white">StockPulse v1.0</span>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Real-time price tracker with customizable alerts & financial metrics.
        </p>
      </div>
    </aside>
  );
};
