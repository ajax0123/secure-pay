// Module: DisputeCase | Responsibility: Track dispute workflow linked to fraud reports and admin resolution notes.
const mongoose = require('mongoose');

const disputeCaseSchema = new mongoose.Schema(
  {
    transaction_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fraud_report_id: { type: mongoose.Schema.Types.ObjectId, ref: 'FraudReport', required: true },
    user_message: { type: String, required: true },
    admin_notes: { type: String, default: '' },
    priority: {
      type: String,
      enum: ['normal', 'high'],
      default: 'high'
    },
    status: {
      type: String,
      enum: ['open', 'under_review', 'resolved', 'closed'],
      default: 'open'
    },
    created_at: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

module.exports = mongoose.model('DisputeCase', disputeCaseSchema);
