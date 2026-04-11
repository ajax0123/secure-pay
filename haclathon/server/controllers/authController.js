// Module: authController | Responsibility: Handle authentication, KYC hashing, and session lifecycle endpoints.
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Session = require('../models/Session');
const { decrypt, encrypt, identityToHash } = require('../utils/encryption');
const { signAuthToken } = require('../utils/jwtHelper');
const { createSession, notifyIfNewDevice } = require('../services/sessionService');
const { logEvent } = require('../services/auditLogger');

const SALT_ROUNDS = 12;

const signup = async (req, res) => {
  try {
    const { name, email, password, transactionPin } = req.validatedBody;
    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedName = String(name).trim();
    const emailHash = identityToHash(normalizedEmail);
    const nameHash = identityToHash(normalizedName);

    const existing = await User.findOne({ email: emailHash });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const transaction_pin_hash = await bcrypt.hash(transactionPin, SALT_ROUNDS);
    const wallet_balance_encrypted = encrypt('10000'); // LAYER 2

    const user = await User.create({
      name: nameHash,
      email: emailHash,
      name_encrypted: encrypt(normalizedName),
      email_encrypted: encrypt(normalizedEmail),
      password_hash,
      transaction_pin_hash,
      wallet_balance_encrypted,
      kyc_verified: false,
      role: 'user',
      risk_score: 42
    });

    return res.status(201).json({
      message: 'Signup successful.',
      user: {
        id: user._id,
        name: normalizedName,
        email: normalizedEmail,
        wallet_balance: '₹10000',
        risk_score: 42
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Signup failed.', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.validatedBody;
    const normalizedEmail = String(email).trim().toLowerCase();
    const emailHash = identityToHash(normalizedEmail);
    const user = await User.findOne({ email: emailHash });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const now = new Date();
    if (user.lock_until && user.lock_until > now) {
      return res.status(423).json({ message: 'Account temporarily locked due to failed logins.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      user.login_attempts += 1;
      if (user.login_attempts >= 5) {
        user.lock_until = new Date(Date.now() + 15 * 60 * 1000);
      }
      await user.save();
      await logEvent(user._id, 'LOGIN', { fingerprint: `fail-${Date.now()}`, status: 'failed' }); // LAYER 5
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    user.login_attempts = 0;
    user.lock_until = null;
    await user.save();

    try {
      await notifyIfNewDevice(user._id, req);
    } catch (notificationError) {
      console.error('Failed to send new-device notification:', notificationError.message || notificationError);
    }

    const session = await createSession(user._id, req);

    const token = signAuthToken({ userId: user._id.toString(), role: user.role, sessionId: session._id.toString() });
    // LAYER 1: JWT issued here after credential verification and session binding

    await logEvent(user._id, 'LOGIN', { fingerprint: `success-${session._id}`, status: 'success' }); // LAYER 5

    return res.status(200).json({
      message: 'Login successful.',
      token,
      sessionId: session._id,
      user: {
        id: user._id,
        name: decrypt(user.name_encrypted),
        email: decrypt(user.email_encrypted),
        role: user.role,
        account_frozen: user.account_frozen,
        freeze_reason: user.freeze_reason,
        security_lock_enabled: user.security_lock_enabled,
        risk_score: user.risk_score || 42
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed.', error: error.message });
  }
};

const kyc = async (req, res) => {
  try {
    const { identityNumber } = req.validatedBody;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const normalized = String(identityNumber).replace(/\s+/g, '');
    const hash = identityToHash(normalized); // LAYER 6
    const last4 = normalized.slice(-4);

    user.identity_hash = hash; // LAYER 3
    user.identity_last4 = last4;
    user.kyc_verified = true;
    await user.save();

    const masked = `XXXX-XXXX-${last4}`; // LAYER 3
    return res.status(200).json({
      message: 'KYC completed.',
      identity_display: masked,
      kyc_verified: true
    });
  } catch (error) {
    return res.status(500).json({ message: 'KYC failed.', error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    const { sessionId } = req.validatedBody || {};
    const query = sessionId
      ? { _id: sessionId, user_id: req.user.userId }
      : { user_id: req.user.userId, is_active: true };

    await Session.updateMany(query, { $set: { is_active: false, last_active: new Date() } });
    return res.status(200).json({ message: 'Logout successful.' });
  } catch (error) {
    return res.status(500).json({ message: 'Logout failed.', error: error.message });
  }
};

module.exports = {
  signup,
  login,
  kyc,
  logout
};
