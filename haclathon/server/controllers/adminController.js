// Module: adminController | Responsibility: Provide administrative actions for fraud operations, account control, and dispute closure.
const User = require('../models/User');
const FraudReport = require('../models/FraudReport');
const DisputeCase = require('../models/DisputeCase');
const { decrypt } = require('../utils/encryption');
const { logEvent } = require('../services/auditLogger');

const getFraudReports = async (req, res) => {
  try {
    const reports = await FraudReport.find({
      $or: [
        { ai_generated: true },
        { status: { $in: ['open', 'investigating'] } }
      ]
    })
      .populate({ path: 'reported_by', select: 'name_encrypted email_encrypted risk_score' })
      .populate('transaction_id')
      .sort({ status: 1, risk_score: -1, created_at: -1 })
      .lean();

    const formattedReports = reports.map((report) => {
      if (report.reported_by?.name_encrypted) {
        const decryptedName = decrypt(report.reported_by.name_encrypted);
        report.reported_by.name = decryptedName;
        report.reported_by_name = decryptedName;
      }
      if (report.reported_by?.email_encrypted) {
        const decryptedEmail = decrypt(report.reported_by.email_encrypted);
        report.reported_by.email = decryptedEmail;
        report.reported_by_email = decryptedEmail;
      }
      return report;
    });

    return res.status(200).json({ reports: formattedReports });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch fraud reports.', error: error.message });
  }
};

const freezeAccount = async (req, res) => {
  try {
    const { userId, reason } = req.validatedBody;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.account_frozen = true;
    user.freeze_reason = reason || 'Admin action';
    await user.save();

    await logEvent(user._id, 'ACCOUNT_FREEZE', { fingerprint: `admin-freeze-${Date.now()}`, reason: user.freeze_reason }); // LAYER 5

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${user._id}`).emit('account_frozen', {
        userId: user._id,
        reason: user.freeze_reason,
        riskScore: user.risk_score
      });
    }

    return res.status(200).json({ message: 'Account frozen successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to freeze account.', error: error.message });
  }
};

const unfreezeAccount = async (req, res) => {
  try {
    const { userId } = req.validatedBody;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.account_frozen = false;
    user.freeze_reason = null;
    await user.save();

    return res.status(200).json({ message: 'Account unfrozen successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to unfreeze account.', error: error.message });
  }
};

const closeCase = async (req, res) => {
  try {
    const { disputeCaseId, adminNotes, status } = req.validatedBody;

    const dispute = await DisputeCase.findById(disputeCaseId);
    if (!dispute) {
      return res.status(404).json({ message: 'Dispute case not found.' });
    }

    dispute.status = status || 'resolved';
    dispute.admin_notes = adminNotes || '';
    await dispute.save();

    const report = await FraudReport.findById(dispute.fraud_report_id);
    if (report) {
      report.status = dispute.status === 'closed' ? 'resolved' : 'investigating';
      await report.save();
    }

    return res.status(200).json({ message: 'Case updated successfully.', dispute });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to close case.', error: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'name email name_encrypted email_encrypted risk_score account_frozen freeze_reason role created_at')
      .sort({ created_at: -1 })
      .lean();

    const formattedUsers = users.map((user) => {
      if (user.name_encrypted) {
        const decryptedName = decrypt(user.name_encrypted);
        user.name = decryptedName;
        user.decrypted_name = decryptedName;
      }
      if (user.email_encrypted) {
        const decryptedEmail = decrypt(user.email_encrypted);
        user.email = decryptedEmail;
        user.decrypted_email = decryptedEmail;
      }
      return user;
    });

    return res.status(200).json({ users: formattedUsers });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch users.', error: error.message });
  }
};

const getCaseTimeline = async (req, res) => {
  try {
    const report = await FraudReport.findById(req.params.fraudReportId).populate('transaction_id').lean();

    if (!report || !report.transaction_id) {
      return res.status(404).json({ message: 'Fraud report not found.' });
    }

    const senderId = report.transaction_id.sender.toString();
    const baseTime = new Date(report.transaction_id.timestamp || report.created_at || Date.now());
    const windowStart = new Date(baseTime.getTime() - 12 * 60 * 60 * 1000);
    const windowEnd = new Date(baseTime.getTime() + 12 * 60 * 60 * 1000);

    const { AuditLog } = require('../services/auditLogger');
    const logs = await AuditLog.find({
      user_id: senderId,
      last_seen_at: { $gte: windowStart, $lte: windowEnd }
    })
      .sort({ last_seen_at: 1 })
      .lean();

    const timeline = logs.map((entry) => ({
      time: (entry.last_seen_at || entry.first_seen_at).toISOString(),
      event_type: entry.event_type,
      event: `${entry.event_type} ${entry.metadata?.direction ? `(${entry.metadata.direction})` : ''}`.trim(),
      metadata: entry.metadata || {}
    }));

    return res.status(200).json({
      fraudReportId: report._id,
      transactionId: report.transaction_id._id,
      timeline
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch case timeline.', error: error.message });
  }
};

module.exports = {
  getFraudReports,
  freezeAccount,
  unfreezeAccount,
  closeCase,
  getUsers,
  getCaseTimeline
};
