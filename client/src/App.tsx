import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

import { MainLayout } from './layouts/MainLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { StockDetailsPage } from './pages/StockDetailsPage';
import { IndexDetailsPage } from './pages/IndexDetailsPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { AlertsPage } from './pages/AlertsPage';
import { NewsPage } from './pages/NewsPage';
import { ComparePage } from './pages/ComparePage';
import { MarketsPage } from './pages/MarketsPage';
import { ProfilePage } from './pages/ProfilePage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-gray-400">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mb-2" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Authenticated Routes wrapped in MainLayout */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <DashboardPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/stock/:symbol"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <StockDetailsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/index/:symbol"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <IndexDetailsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/watchlist"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <WatchlistPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/alerts"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <AlertsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/news"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <NewsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/compare"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ComparePage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/markets"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <MarketsPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ProfilePage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
