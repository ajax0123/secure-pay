// Module: autoFraudScanner | Responsibility: Generate AI fraud reports from suspicious transaction activity.
const User = require('../models/User');
const FraudReport = require('../models/FraudReport');
const { analyzeCase } = require('./investigationService');
const { logEvent } = require('./auditLogger');
const { sendEmail, emailTemplates } = require('./notificationService');
const { decrypt } = require('../utils/encryption');

const createAutoFraudReportForTransaction = async (transaction, io) => {
  if (!transaction || !transaction._id) {
    return null;
  }

  const existing = await FraudReport.findOne({ transaction_id: transaction._id, ai_generated: true }).lean();
  if (existing) {
    return existing;
  }

  if (transaction.risk_score < 60) {
    return null;
  }

  const senderId = transaction.sender;
  const report = await FraudReport.create({
    transaction_id: transaction._id,
    reported_by: senderId,
    reason: 'AI detected suspicious transfer activity and flagged it for review.',
    ai_analysis: 'AI fraud scanner has flagged this transaction and created a report automatically.',
    risk_score: transaction.risk_score,
    status: transaction.risk_score >= 70 ? 'investigating' : 'open',
    ai_generated: true
  });

  const analysis = await analyzeCase(report._id).catch(() => ({
    summary: 'Preliminary AI review queued.',
    risk_level: 'medium',
    recommended_action: 'Monitor account activity.',
    timeline: []
  }));

  report.ai_analysis = `${analysis.summary} ${analysis.recommended_action || ''}`.trim();
  await report.save();

  await logEvent(senderId, 'FRAUD_REPORT', { fingerprint: `ai-fraud-${report._id}`, transactionId: transaction._id });

  const user = await User.findById(senderId);
  if (user && transaction.risk_score >= 60) {
    user.risk_score = Math.max(user.risk_score || 0, transaction.risk_score);
    await user.save();

    try {
      await sendEmail(decrypt(user.email_encrypted), 'Suspicious Activity Detected', emailTemplates.fraud_report({ transactionId: transaction._id }));
    } catch (emailError) {
      console.error('Failed to send AI fraud notification email:', emailError);
    }
  }
  if (io) {
    io.to('admin').emit('new_fraud_report', {
      fraudReportId: report._id,
      transactionId: transaction._id,
      userId: senderId,
      riskScore: transaction.risk_score,
      status: report.status,
      reason: report.reason,
      analysis
    });
  }

  return report;
};

module.exports = {
  createAutoFraudReportForTransaction
};
