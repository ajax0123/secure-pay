// Module: Session | Responsibility: Track authenticated device sessions for anomaly detection and revocation.
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    device: { type: String, required: true },
    browser: { type: String, required: true },
    ip_address: { type: String, required: true },
    location: { type: String, default: 'Unknown' },
    login_time: { type: Date, default: Date.now },
    last_active: { type: Date, default: Date.now },
    is_active: { type: Boolean, default: true }
  },
  { versionKey: false }
);

module.exports = mongoose.model('Session', sessionSchema);
