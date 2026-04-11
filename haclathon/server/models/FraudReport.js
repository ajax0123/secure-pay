// Module: FraudReport | Responsibility: Persist user-submitted fraud complaints and investigation lifecycle state.
const mongoose = require('mongoose');

const fraudReportSchema = new mongoose.Schema(
  {
    transaction_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true },
    reported_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true, trim: true },
    ai_generated: { type: Boolean, default: false },
    ai_analysis: { type: String, default: '' },
    risk_score: { type: Number, default: 0, min: 0, max: 100 },
    status: {
      type: String,
      enum: ['open', 'investigating', 'resolved', 'rejected'],
      default: 'open'
    },
    created_at: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

module.exports = mongoose.model('FraudReport', fraudReportSchema);
