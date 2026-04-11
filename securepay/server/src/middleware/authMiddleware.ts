import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.ts';
import { env } from '../config/env.ts';

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized' });
  }

  try {
    const decoded: any = jwt.verify(token, env.jwtSecret);
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    if (req.user.lockedUntil && req.user.lockedUntil > new Date()) {
      return res.status(403).json({ success: false, error: 'Account is locked' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Not authorized' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'User role not authorized' });
    }
    next();
  };
};
