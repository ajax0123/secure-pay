// Module: walletController | Responsibility: Execute wallet operations including balance, transfers, PIN, sessions, and receipts.
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Session = require('../models/Session');
const { encrypt, decrypt, identityToHash } = require('../utils/encryption');
const { calculateRiskScore } = require('../services/fraudService');
const { createAutoFraudReportForTransaction } = require('../services/autoFraudScanner');
const { logEvent } = require('../services/auditLogger');
const { sendEmail, emailTemplates } = require('../services/notificationService');
const { signPinToken, verifyPinToken } = require('../utils/jwtHelper');
const { generateReceipt } = require('../services/receiptService');

const getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const balance = Number(decrypt(user.wallet_balance_encrypted)); // LAYER 2
    return res.status(200).json({ balance: balance.toFixed(2), currency: 'INR' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch balance.', error: error.message });
  }
};

const verifyPin = async (req, res) => {
  try {
    const { pin } = req.validatedBody;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.pin_block_until && user.pin_block_until > new Date()) {
      return res.status(423).json({ message: 'PIN verification blocked for 10 minutes.' });
    }

    const isValid = await bcrypt.compare(pin, user.transaction_pin_hash);
    if (!isValid) {
      user.pin_attempts_count += 1;
      await logEvent(user._id, 'PIN_FAIL', { fingerprint: `pin-fail-${Date.now()}` }); // LAYER 5

      if (user.pin_attempts_count >= 3) {
        user.pin_attempts_blocked = true;
        user.pin_block_until = new Date(Date.now() + 10 * 60 * 1000);
      }

      await user.save();
      return res.status(401).json({ message: 'Invalid transaction PIN.' });
    }

    user.pin_attempts_count = 0;
    user.pin_attempts_blocked = false;
    user.pin_block_until = null;
    await user.save();

    const pinToken = signPinToken({ userId: user._id.toString(), scope: 'wallet_transfer' }); // LAYER 1
    return res.status(200).json({ message: 'PIN verified.', pinToken, expiresIn: '5m' });
  } catch (error) {
    return res.status(500).json({ message: 'PIN verification failed.', error: error.message });
  }
};

const freezeAccountSelf = async (req, res) => {
  try {
    const { reason } = req.validatedBody;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.account_frozen = true;
    user.freeze_reason = reason || 'User requested freeze. Please complete necessary actions before unfreezing.';
    await user.save();

    await logEvent(user._id, 'ACCOUNT_FREEZE', { fingerprint: `self-freeze-${Date.now()}`, reason: user.freeze_reason });

    return res.status(200).json({ message: 'Account frozen successfully.', freezeReason: user.freeze_reason });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to freeze account.', error: error.message });
  }
};

const sendMoney = async (req, res) => {
  try {
    const { receiverEmail, amount, note, pinToken } = req.validatedBody;
    const normalizedReceiverEmail = String(receiverEmail).trim().toLowerCase();

    const pinPayload = verifyPinToken(pinToken);
    if (pinPayload.userId !== req.user.userId || pinPayload.scope !== 'wallet_transfer') {
      return res.status(401).json({ message: 'Invalid PIN authorization token.' });
    }

    const sender = await User.findById(req.user.userId);
    if (!sender) {
      return res.status(404).json({ message: 'Sender not found.' });
    }

    const receiver = await User.findOne({ email: identityToHash(normalizedReceiverEmail) });
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found.' });
    }

    if (sender._id.toString() === receiver._id.toString()) {
      return res.status(400).json({ message: 'Cannot transfer to your own account.' });
    }

    if (sender.account_frozen) {
      return res.status(403).json({ message: 'Account frozen. Transfers are blocked.' });
    }

    if (sender.security_lock_enabled || receiver.security_lock_enabled) {
      return res.status(403).json({ message: 'Security lock enabled. Send/receive blocked.' });
    }

    if (receiver.account_frozen) {
      return res.status(403).json({ message: 'Receiver account frozen. Transfer blocked.' });
    }

    const senderBalance = Number(decrypt(sender.wallet_balance_encrypted)); // LAYER 2
    if (senderBalance < amount) {
      return res.status(400).json({ message: 'Insufficient balance.' });
    }

    const riskScore = await calculateRiskScore(sender._id, amount); // LAYER 4

    const payload = {
      reference: `TXN-${Date.now()}`,
      note: note || '',
      initiated_at: new Date().toISOString()
    };

    const tx = await Transaction.create({
      sender: sender._id,
      receiver: receiver._id,
      amount,
      encrypted_payload: encrypt(JSON.stringify(payload)), // LAYER 2
      risk_score: riskScore,
      status: riskScore >= 70 ? 'flagged' : 'completed'
    });

    await createAutoFraudReportForTransaction(tx, req.app.get('io'));

    sender.wallet_balance_encrypted = encrypt(String(senderBalance - amount)); // LAYER 2
    const receiverBalance = Number(decrypt(receiver.wallet_balance_encrypted)); // LAYER 2
    receiver.wallet_balance_encrypted = encrypt(String(receiverBalance + amount)); // LAYER 2

    sender.risk_score = Math.max(sender.risk_score || 0, riskScore);

    await sender.save();
    await receiver.save();

    await logEvent(sender._id, 'TRANSACTION', { fingerprint: `tx-${tx._id}`, direction: 'debit', amount }); // LAYER 5
    await logEvent(receiver._id, 'TRANSACTION', { fingerprint: `tx-${tx._id}`, direction: 'credit', amount }); // LAYER 5

    const time = new Date(tx.timestamp).toLocaleString('en-IN');
    try {
      await sendEmail(
        decrypt(sender.email_encrypted),
        'Money Sent Confirmation',
        emailTemplates.send_money({ amount, receiver: decrypt(receiver.email_encrypted), time })
      );
    } catch (emailError) {
      console.error('Failed to send sender email after transfer:', emailError);
    }

    try {
      await sendEmail(
        decrypt(receiver.email_encrypted),
        'Money Received Alert',
        emailTemplates.receive_money({ amount, sender: decrypt(sender.email_encrypted), time })
      );
    } catch (emailError) {
      console.error('Failed to send receiver email after transfer:', emailError);
    }

    return res.status(200).json({
      message: 'Transfer successful.',
      transaction: {
        id: tx._id,
        amount,
        currency: 'INR',
        status: tx.status,
        risk_score: tx.risk_score
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Transfer failed.', error: error.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      Transaction.find({
        $or: [{ sender: req.user.userId }, { receiver: req.user.userId }]
      })
        .populate('sender', 'name email name_encrypted email_encrypted')
        .populate('receiver', 'name email name_encrypted email_encrypted')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Transaction.countDocuments({
        $or: [{ sender: req.user.userId }, { receiver: req.user.userId }]
      })
    ]);

    const transactions = rows.map((tx) => {
      let payload = null;
      try {
        payload = JSON.parse(decrypt(tx.encrypted_payload)); // LAYER 2
      } catch (error) {
        payload = { reference: 'UNAVAILABLE' };
      }

      const sender = tx.sender
        ? {
            id: tx.sender._id,
            name: tx.sender.name_encrypted ? decrypt(tx.sender.name_encrypted) : tx.sender.name,
            email: tx.sender.email_encrypted ? decrypt(tx.sender.email_encrypted) : tx.sender.email
          }
        : null;

      const receiver = tx.receiver
        ? {
            id: tx.receiver._id,
            name: tx.receiver.name_encrypted ? decrypt(tx.receiver.name_encrypted) : tx.receiver.name,
            email: tx.receiver.email_encrypted ? decrypt(tx.receiver.email_encrypted) : tx.receiver.email
          }
        : null;

      return {
        id: tx._id,
        amount: tx.amount,
        status: tx.status,
        risk_score: tx.risk_score,
        timestamp: tx.timestamp,
        sender,
        receiver,
        payload
      };
    });

    return res.status(200).json({
      page,
      limit,
      total,
      transactions
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch transactions.', error: error.message });
  }
};

const toggleSecurityLock = async (req, res) => {
  try {
    const { enabled, password } = req.validatedBody;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (enabled === false) {
      const ok = await bcrypt.compare(password || '', user.password_hash);
      if (!ok) {
        return res.status(401).json({ message: 'Password required to unlock security lock.' });
      }
    }

    user.security_lock_enabled = enabled;
    await user.save();

    return res.status(200).json({
      message: `Security lock ${enabled ? 'enabled' : 'disabled'}.`,
      security_lock_enabled: user.security_lock_enabled
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update security lock.', error: error.message });
  }
};

const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ user_id: req.user.userId, is_active: true })
      .sort({ last_active: -1 })
      .lean();

    return res.status(200).json({ sessions });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch sessions.', error: error.message });
  }
};

const removeSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await Session.findOneAndUpdate(
      { _id: id, user_id: req.user.userId },
      { $set: { is_active: false, last_active: new Date() } },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    return res.status(200).json({ message: 'Session revoked.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to revoke session.', error: error.message });
  }
};

const downloadReceipt = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const tx = await Transaction.findById(transactionId).lean();

    if (!tx) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    const isOwner =
      tx.sender.toString() === req.user.userId || tx.receiver.toString() === req.user.userId;

    if (!isOwner) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const buffer = await generateReceipt(transactionId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${transactionId}.pdf`);
    return res.status(200).send(buffer);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to generate receipt.', error: error.message });
  }
};

module.exports = {
  getBalance,
  sendMoney,
  getTransactions,
  verifyPin,
  toggleSecurityLock,
  freezeAccountSelf,
  getSessions,
  removeSession,
  downloadReceipt
};
