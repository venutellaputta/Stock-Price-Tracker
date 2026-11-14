import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('demo@stockpulse.local');
    setPassword('demo123');
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4 selection:bg-blue-600 selection:text-white">
      <div className="w-full max-w-md bg-[#111827] border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white font-mono">
              Stock<span className="text-blue-500">Pulse</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-white">Welcome Back</h2>
          <p className="text-xs text-gray-400 mt-1">Sign in to access your stock tracker dashboard</p>
        </div>

        {/* Demo Credentials Quick Fill Button */}
        <div className="mb-6 p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-blue-400 block">Demo Mode Active</span>
            <span className="text-[11px] text-gray-400 font-mono">demo@stockpulse.local / demo123</span>
          </div>
          <button
            type="button"
            onClick={fillDemoAccount}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition-all flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Use Demo Account</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-400">Password</label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
          >
            <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400 font-semibold hover:underline">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
};
