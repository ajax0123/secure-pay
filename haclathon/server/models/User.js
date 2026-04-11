// Module: User | Responsibility: Persist wallet user identity, security state, and account profile data.
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // SHA-256 hash of user name
    email: { type: String, required: true, unique: true, lowercase: true, index: true }, // SHA-256 hash of email
    name_encrypted: { type: String, required: true },
    email_encrypted: { type: String, required: true },
    password_hash: { type: String, required: true },
    transaction_pin_hash: { type: String, required: true },
    wallet_balance_encrypted: { type: String, required: true },
    identity_hash: { type: String, default: null }, // LAYER 3
    identity_last4: { type: String, default: null },
    kyc_verified: { type: Boolean, default: false },
    risk_score: { type: Number, default: 0, min: 0, max: 100 },
    account_frozen: { type: Boolean, default: false },
    freeze_reason: { type: String, default: null },
    security_lock_enabled: { type: Boolean, default: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    login_attempts: { type: Number, default: 0 },
    lock_until: { type: Date, default: null },
    pin_attempts_count: { type: Number, default: 0 },
    pin_block_until: { type: Date, default: null },
    pin_attempts_blocked: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

module.exports = mongoose.model('User', userSchema);
