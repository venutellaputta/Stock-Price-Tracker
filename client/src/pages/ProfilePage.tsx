import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { authService } from '../services/api';
import { formatDate } from '../utils/formatters';
import { User as UserIcon, Lock, Shield, Bookmark, Bell, Check } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { addToast } = useSocket();

  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsUpdatingProfile(true);
    try {
      const res = await authService.updateProfile(name.trim());
      if (res.success) {
        await refreshUser();
        addToast('Profile Updated', 'Your name has been updated', 'success');
      }
    } catch (err: any) {
      addToast('Error', err.response?.data?.message || 'Failed to update profile', 'danger');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    setIsChangingPass(true);
    try {
      const res = await authService.changePassword(currentPassword, newPassword);
      if (res.success) {
        setCurrentPassword('');
        setNewPassword('');
        addToast('Password Changed', 'Your password has been updated', 'success');
      }
    } catch (err: any) {
      addToast('Error', err.response?.data?.message || 'Failed to change password', 'danger');
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
        <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
          <UserIcon className="w-6 h-6 text-blue-500" />
          <span>User Account Settings & Security</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">Manage profile details, credentials, and watchlist preferences</p>
      </div>

      {/* Account Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-lg">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <div className="font-bold text-base text-white">{user?.name}</div>
            <div className="text-xs text-gray-400 font-mono">{user?.email}</div>
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-gray-400">Watchlist Equities</div>
            <div className="text-xl font-bold font-mono text-white">{user?.watchlistCount || 0} saved</div>
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-gray-400">Active Price Alerts</div>
            <div className="text-xl font-bold font-mono text-white">{user?.activeAlertsCount || 0} active</div>
          </div>
        </div>
      </div>

      {/* Forms Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Details Form */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl">
          <h3 className="font-bold text-base text-white mb-4 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-blue-400" />
            <span>Update Profile Details</span>
          </h3>

          <form onSubmit={handleUpdateName} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Email Address</label>
              <input
                type="text"
                disabled
                value={user?.email || ''}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Member Since</label>
              <input
                type="text"
                disabled
                value={formatDate(user?.created_at)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-500 font-mono cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all disabled:opacity-50"
            >
              {isUpdatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl">
          <h3 className="font-bold text-base text-white mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Change Security Password</span>
          </h3>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isChangingPass}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md transition-all disabled:opacity-50"
            >
              {isChangingPass ? 'Updating Password...' : 'Update Security Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
