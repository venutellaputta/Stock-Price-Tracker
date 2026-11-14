import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { ToastNotificationContainer } from '../components/ToastNotification';

interface MainLayoutProps {
  children?: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col selection:bg-blue-600 selection:text-white">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          {children || <Outlet />}
        </main>
      </div>

      <ToastNotificationContainer />
    </div>
  );
};
