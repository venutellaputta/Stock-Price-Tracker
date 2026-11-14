import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/userModel.js';
import { WatchlistModel } from '../models/watchlistModel.js';
import { AlertModel } from '../models/alertModel.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

const JWT_SECRET = process.env.JWT_SECRET || 'stockpulse_jwt_secret_key_change_in_production_2025';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        res.status(400).json({ success: false, message: 'All fields (name, email, password) are required.' });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
        return;
      }

      const existing = await UserModel.findByEmail(email);
      if (existing) {
        res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const userId = generateId();
      const user = await UserModel.create(userId, name, email, passwordHash);

      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        token,
        user: { id: user.id, name: user.name, email: user.email, created_at: user.created_at }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Registration failed.' });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ success: false, message: 'Email and password are required.' });
        return;
      }

      const user = await UserModel.findByEmail(email);
      if (!user) {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        success: true,
        message: 'Login successful.',
        token,
        user: { id: user.id, name: user.name, email: user.email, created_at: user.created_at }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Login failed.' });
    }
  }

  static async me(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      const watchlist = await WatchlistModel.getByUserId(userId);
      const alerts = await AlertModel.getByUserId(userId);

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at,
          watchlistCount: watchlist.length,
          activeAlertsCount: alerts.filter(a => a.status === 'ACTIVE').length
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch user profile.' });
    }
  }

  static async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { name } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      if (!name || name.trim().length === 0) {
        res.status(400).json({ success: false, message: 'Name cannot be empty.' });
        return;
      }

      await UserModel.updateName(userId, name.trim());
      const updatedUser = await UserModel.findById(userId);

      res.json({ success: true, message: 'Profile updated successfully.', user: updatedUser });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to update profile.' });
    }
  }

  static async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { currentPassword, newPassword } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      if (!currentPassword || !newPassword) {
        res.status(400).json({ success: false, message: 'Both current password and new password are required.' });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
        return;
      }

      const user = await UserModel.findByEmail(req.user?.email || '');
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
        res.status(400).json({ success: false, message: 'Incorrect current password.' });
        return;
      }

      const newHash = await bcrypt.hash(newPassword, 10);
      await UserModel.updatePassword(userId, newHash);

      res.json({ success: true, message: 'Password updated successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to change password.' });
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    res.json({ success: true, message: 'Logged out successfully.' });
  }
}
