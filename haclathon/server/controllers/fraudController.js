// Module: fraudController | Responsibility: Manage fraud reporting, user fraud logs, and dispute case operations.
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const FraudReport = require('../models/FraudReport');
const DisputeCase = require('../models/DisputeCase');
const { calculateRiskScore } = require('../services/fraudService');
const { analyzeCase } = require('../services/investigationService');
const { logEvent } = require('../services/auditLogger');
const { sendEmail, emailTemplates } = require('../services/notificationService');
const { decrypt } = require('../utils/encryption');

const reportFraud = async (req, res) => {
  try {
    const { transactionId, reason } = req.validatedBody;
    const tx = await Transaction.findById(transactionId);
    if (!tx) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'Reporting user not found.' });
    }

    const riskScore = await calculateRiskScore(user._id, tx.amount);
    const status = riskScore >= 70 ? 'investigating' : 'open';

    const report = await FraudReport.create({
      transaction_id: transactionId,
      reported_by: req.user.userId,
      reason,
      ai_analysis: `Manual fraud report created with risk score ${riskScore}.`,
      risk_score: riskScore,
      status,
      ai_generated: false
    });

    const analysis = await analyzeCase(report._id);
    await FraudReport.findByIdAndUpdate(report._id, {
      $set: { ai_analysis: `${analysis.summary} | ${analysis.recommended_action}` }
    });

    if (riskScore >= 60) {
      user.account_frozen = true;
      user.freeze_reason = 'Fraud investigation';
      await user.save();
      await logEvent(user._id, 'ACCOUNT_FREEZE', { fingerprint: `manual-fraud-freeze-${Date.now()}`, reason: user.freeze_reason }); // LAYER 5

      const io = req.app.get('io');
      if (io) {
        io.to(`user:${user._id}`).emit('account_frozen', {
          userId: user._id,
          reason: user.freeze_reason,
          riskScore
        });
      }
    }

    await logEvent(req.user.userId, 'FRAUD_REPORT', { fingerprint: `fraud-${report._id}`, transactionId }); // LAYER 5

    if (req.app.get('io')) {
      req.app.get('io').to('admin').emit('new_fraud_report', {
        fraudReportId: report._id,
        transactionId,
        userId: req.user.userId,
        riskScore,
        status: report.status,
        reason
      });
    }

    if (riskScore >= 60) {
      await sendEmail(decrypt(user.email_encrypted), 'Fraud Report Received', emailTemplates.fraud_report({ transactionId }));
    }

    return res.status(201).json({ message: 'Fraud report submitted.', report });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to submit fraud report.', error: error.message });
  }
};

const getFraudLogs = async (req, res) => {
  try {
    const reports = await FraudReport.find({ reported_by: req.user.userId })
      .populate('transaction_id')
      .sort({ created_at: -1 })
      .lean();

    return res.status(200).json({ reports });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch fraud reports.', error: error.message });
  }
};

const createDisputeCase = async (req, res) => {
  try {
    const { transactionId, fraudReportId, message } = req.validatedBody;

    const report = await FraudReport.findById(fraudReportId);
    if (!report) {
      return res.status(404).json({ message: 'Fraud report not found.' });
    }

    const tx = await Transaction.findById(transactionId);
    if (!tx) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    if (report.reported_by.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only reporting user can create dispute.' });
    }

    if (!message || message.trim().length < 5) {
      return res.status(400).json({ message: 'Dispute message is required and must be at least 5 characters.' });
    }

    const dispute = new DisputeCase({
      transaction_id: transactionId,
      user_id: req.user.userId,
      fraud_report_id: fraudReportId,
      user_message: message,
      priority: 'high',
      status: 'open'
    });

    await dispute.save();

    if (process.env.NODE_ENV !== 'production') {
      console.log('Created dispute:', {
        _id: dispute._id.toString(),
        transaction_id: dispute.transaction_id.toString(),
        fraud_report_id: dispute.fraud_report_id.toString(),
        user_message: dispute.user_message
      });
    }

    return res.status(201).json({ message: 'Dispute case created.', dispute });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create dispute case.', error: error.message });
  }
};

const getDisputeStatus = async (req, res) => {
  try {
    const dispute = await DisputeCase.findById(req.params.id)
      .populate('transaction_id')
      .populate('fraud_report_id')
      .populate({ path: 'user_id', select: req.user.role === 'admin' ? 'name_encrypted' : '_id' })
      .lean();

    if (!dispute) {
      return res.status(404).json({ message: 'Dispute case not found.' });
    }

    const disputeUserId = dispute.user_id?._id?.toString?.() || dispute.user_id?.toString?.();
    const isOwner = disputeUserId === req.user.userId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    if (isAdmin) {
      if (dispute.user_id?.name_encrypted) {
        dispute.user_display_name = decrypt(dispute.user_id.name_encrypted);
      } else if (dispute.user_id) {
        const user = await User.findById(dispute.user_id).select('name_encrypted').lean();
        if (user?.name_encrypted) {
          dispute.user_display_name = decrypt(user.name_encrypted);
        }
      }
    }

    return res.status(200).json({ dispute });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch dispute status.', error: error.message });
  }
};

const getUserDisputes = async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { user_id: req.user.userId };
    const disputes = await DisputeCase.find(query)
      .populate('transaction_id')
      .populate('fraud_report_id')
      .populate({ path: 'user_id', select: req.user.role === 'admin' ? 'name_encrypted' : '_id' })
      .sort({ created_at: -1 })
      .lean();

    if (req.user.role === 'admin') {
      for (const dispute of disputes) {
        if (dispute.user_id?.name_encrypted) {
          dispute.user_display_name = decrypt(dispute.user_id.name_encrypted);
        } else if (dispute.user_id) {
          const user = await User.findById(dispute.user_id).select('name_encrypted').lean();
          if (user?.name_encrypted) {
            dispute.user_display_name = decrypt(user.name_encrypted);
          }
        }
      }
    }

    return res.status(200).json({ disputes });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch disputes.', error: error.message });
  }
};

module.exports = {
  reportFraud,
  getFraudLogs,
  createDisputeCase,
  getDisputeStatus,
  getUserDisputes
};
