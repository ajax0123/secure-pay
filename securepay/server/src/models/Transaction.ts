import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const transactionSchema = new mongoose.Schema({
  txId: { type: String, default: uuidv4, unique: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: mongoose.Schema.Types.Decimal128, required: true },
  riskScore: { type: Number, default: 0 },
  isFlagged: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'blocked'], default: 'pending' },
  signature: { type: String },
  encryptedMeta: { type: String }
}, { timestamps: true });

transactionSchema.index({ senderId: 1 });
transactionSchema.index({ receiverId: 1 });
transactionSchema.index({ txId: 1 });

export const Transaction = mongoose.model('Transaction', transactionSchema);
