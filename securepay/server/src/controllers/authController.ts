import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.ts';
import { Wallet } from '../models/Wallet.ts';
import { logAudit } from '../services/auditService.ts';
import { env } from '../config/env.ts';

const generateToken = (id: string) => {
  return jwt.sign({ id }, env.jwtSecret, { expiresIn: env.auth.tokenExpiry });
};

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      passwordHash
    });

    // Create wallet for user
    await Wallet.create({ userId: user._id });

    await logAudit(user._id.toString(), 'USER_REGISTER', { email }, req);

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id.toString())
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return res.status(403).json({ success: false, error: 'Account is locked' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 mins
      }
      await user.save();
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    user.failedLoginAttempts = 0;
    user.lockedUntil = undefined;
    await user.save();

    await logAudit(user._id.toString(), 'USER_LOGIN', {}, req);

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id.toString())
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getMe = async (req: any, res: Response) => {
  res.status(200).json({ success: true, data: req.user });
};
