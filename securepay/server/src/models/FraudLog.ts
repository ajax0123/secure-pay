import mongoose from 'mongoose';

const fraudLogSchema = new mongoose.Schema({
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true },
  riskScore: { type: Number, required: true },
  flags: [{ type: String }],
  recommendation: { type: String, enum: ['ALLOW', 'REVIEW', 'BLOCK'] },
  resolved: { type: Boolean, default: false },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export const FraudLog = mongoose.model('FraudLog', fraudLogSchema);
