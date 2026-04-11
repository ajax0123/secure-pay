// Module: Transaction | Responsibility: Store transfer records with encrypted transaction payload and risk metadata.
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    encrypted_payload: { type: String, required: true },
    risk_score: { type: Number, default: 0, min: 0, max: 100 },
    status: {
      type: String,
      enum: ['pending', 'completed', 'flagged', 'reversed'],
      default: 'pending'
    },
    timestamp: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

transactionSchema.index({ sender: 1, timestamp: -1 });
transactionSchema.index({ receiver: 1, timestamp: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
