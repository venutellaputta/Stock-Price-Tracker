import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
    return;
  }

  const secret = process.env.JWT_SECRET || 'stockpulse_jwt_secret_key_change_in_production_2025';

  jwt.verify(token, secret, (err: any, decoded: any) => {
    if (err) {
      res.status(403).json({ success: false, message: 'Invalid or expired session. Please log in again.' });
      return;
    }
    req.user = decoded;
    next();
  });
}
