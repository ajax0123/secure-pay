import { Response } from 'express';
import mongoose from 'mongoose';
import { Transaction } from '../models/Transaction.ts';
import { Wallet } from '../models/Wallet.ts';
import { User } from '../models/User.ts';
import { FraudLog } from '../models/FraudLog.ts';
import { checkFraud } from '../services/fraudService.ts';
import { signTransaction, encrypt } from '../services/encryptionService.ts';
import { logAudit } from '../services/auditService.ts';

export const sendMoney = async (req: any, res: Response) => {
  const { receiverEmail, amount, note } = req.body;
  const senderId = req.user._id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Validate receiver
    const receiver = await User.findOne({ email: receiverEmail }).session(session);
    if (!receiver) {
      throw new Error('Receiver not found');
    }

    if (receiver._id.equals(senderId)) {
      throw new Error('Cannot send money to yourself');
    }

    // 2. Fraud Detection
    const fraudData = {
      transaction_amount: amount,
      hour_of_day: new Date().getHours(),
      day_of_week: new Date().getDay(),
      sender_avg_transaction: 500, // Mocked for demo
      amount_deviation: amount / 500,
      transactions_last_hour: 1,
      is_new_recipient: true,
      is_round_number: amount % 10 === 0
    };

    const fraudResult = await checkFraud(fraudData);

    if (fraudResult.recommendation === 'BLOCK') {
      await logAudit(senderId, 'TX_BLOCKED', { amount, receiverEmail, flags: fraudResult.flags }, req);
      return res.status(403).json({ success: false, error: 'Transaction blocked by fraud detection', flags: fraudResult.flags });
    }

    // 3. Atomic Transfer
    const senderWallet = await Wallet.findOne({ userId: senderId }).session(session);
    const receiverWallet = await Wallet.findOne({ userId: receiver._id }).session(session);

    if (!senderWallet || Number(senderWallet.balance.toString()) < amount) {
      throw new Error('Insufficient balance');
    }

    // Update balances
    senderWallet.balance = mongoose.Types.Decimal128.fromString((Number(senderWallet.balance.toString()) - amount).toString());
    receiverWallet!.balance = mongoose.Types.Decimal128.fromString((Number(receiverWallet!.balance.toString()) + amount).toString());

    await senderWallet.save({ session });
    await receiverWallet!.save({ session });

    // 4. Create Transaction Record
    const txData = {
      senderId,
      receiverId: receiver._id,
      amount: mongoose.Types.Decimal128.fromString(amount.toString()),
      riskScore: fraudResult.risk_score,
      isFlagged: fraudResult.recommendation === 'REVIEW',
      status: 'completed',
      encryptedMeta: note ? encrypt(note) : undefined
    };

    const tx = new Transaction(txData);
    tx.signature = signTransaction({ ...txData, txId: tx.txId });
    await tx.save({ session });

    // 5. Log Fraud Result if flagged
    if (fraudResult.recommendation === 'REVIEW') {
      await FraudLog.create([{
        transactionId: tx._id,
        riskScore: fraudResult.risk_score,
        flags: fraudResult.flags,
        recommendation: 'REVIEW'
      }], { session });
    }

    await session.commitTransaction();
    session.endSession();

    await logAudit(senderId, 'TX_SEND', { txId: tx.txId, amount }, req);

    res.status(200).json({ success: true, data: tx });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getHistory = async (req: any, res: Response) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ senderId: req.user._id }, { receiverId: req.user._id }]
    })
    .sort({ createdAt: -1 })
    .populate('senderId', 'name email')
    .populate('receiverId', 'name email');

    res.status(200).json({ success: true, data: transactions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
