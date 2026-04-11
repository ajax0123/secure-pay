import { Response } from 'express';
import mongoose from 'mongoose';
import { Wallet } from '../models/Wallet.ts';
import { logAudit } from '../services/auditService.ts';

export const getBalance = async (req: any, res: Response) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.user._id });
    res.status(200).json({ success: true, data: wallet });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const addFunds = async (req: any, res: Response) => {
  const { amount } = req.body;
  try {
    const wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) return res.status(404).json({ success: false, error: 'Wallet not found' });

    wallet.balance = mongoose.Types.Decimal128.fromString((Number(wallet.balance.toString()) + amount).toString());
    await wallet.save();

    await logAudit(req.user._id.toString(), 'WALLET_ADD_FUNDS', { amount }, req);

    res.status(200).json({ success: true, data: wallet });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
