import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  balance: { type: mongoose.Schema.Types.Decimal128, default: 0 },
  currency: { type: String, default: 'USD' },
  isLocked: { type: Boolean, default: false }
}, { timestamps: true });

walletSchema.index({ userId: 1 });

export const Wallet = mongoose.model('Wallet', walletSchema);
