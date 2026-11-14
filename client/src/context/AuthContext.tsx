import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('stockpulse_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await authService.getMe();
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        logout();
      }
    } catch (err) {
      console.warn('Session verification failed, logging out');
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [token]);

  const login = async (email: string, pass: string) => {
    const data = await authService.login(email, pass);
    if (data.success && data.token) {
      localStorage.setItem('stockpulse_token', data.token);
      setToken(data.token);
      setUser(data.user);
    } else {
      throw new Error(data.message || 'Login failed');
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    const data = await authService.register(name, email, pass);
    if (data.success && data.token) {
      localStorage.setItem('stockpulse_token', data.token);
      setToken(data.token);
      setUser(data.user);
    } else {
      throw new Error(data.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('stockpulse_token');
    setToken(null);
    setUser(null);
    authService.login;
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
