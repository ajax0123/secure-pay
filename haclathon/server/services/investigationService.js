// Module: investigationService | Responsibility: Run rule-based fraud case analysis and recommend actions.
const Transaction = require('../models/Transaction');
const Session = require('../models/Session');
const FraudReport = require('../models/FraudReport');
const { AuditLog } = require('./auditLogger');

const analyzeCase = async (fraudReportId) => {
  // This is a rule-based investigation engine, not an LLM API call
  const report = await FraudReport.findById(fraudReportId)
    .populate('transaction_id')
    .populate('reported_by');

  if (!report || !report.transaction_id || !report.reported_by) {
    return {
      summary: 'Insufficient data for investigation.',
      risk_level: 'medium',
      recommended_action: 'Collect additional transaction and session evidence.'
    };
  }

  const tx = report.transaction_id;
  const userId = report.reported_by._id;
  const transactionTime = new Date(tx.timestamp || Date.now());

  const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const userTxns = await Transaction.find({
    sender: userId,
    timestamp: { $gte: last30Days },
    status: { $in: ['completed', 'flagged'] }
  }).lean();

  const avg = userTxns.length
    ? userTxns.reduce((sum, item) => sum + Number(item.amount || 0), 0) / userTxns.length
    : 0;

  const hour = transactionTime.getHours();
  const oddHour = hour < 6 || hour > 23;

  const sessionAtTime = await Session.findOne({
    user_id: userId,
    login_time: { $lte: transactionTime },
    last_active: { $gte: transactionTime }
  })
    .sort({ login_time: -1 })
    .lean();
  const latestSession = await Session.findOne({ user_id: userId }).sort({ login_time: -1 }).lean();
  const deviceMatch = Boolean(sessionAtTime || latestSession);

  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const velocity = await Transaction.countDocuments({
    sender: userId,
    timestamp: { $gte: tenMinutesAgo }
  });

  const windowStart = new Date(transactionTime.getTime() - 12 * 60 * 60 * 1000);
  const windowEnd = new Date(transactionTime.getTime() + 12 * 60 * 60 * 1000);
  const auditEntries = await AuditLog.find({
    user_id: userId,
    last_seen_at: { $gte: windowStart, $lte: windowEnd }
  })
    .sort({ last_seen_at: 1 })
    .lean();

  const timeline = auditEntries.map((entry) => ({
    time: (entry.last_seen_at || entry.first_seen_at).toISOString(),
    event: `${entry.event_type} - ${entry.metadata?.direction || entry.metadata?.reason || 'activity'}`,
    event_type: entry.event_type,
    metadata: entry.metadata || {}
  }));

  let score = 0;
  if (avg > 0 && tx.amount > avg * 5) score += 40;
  if (oddHour) score += 15;
  if (!deviceMatch) score += 20;
  if (velocity > 3) score += 25;

  const risk_level = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';
  const recommended_action =
    risk_level === 'high'
      ? 'Keep account frozen and escalate to manual verification.'
      : risk_level === 'medium'
        ? 'Request additional user confirmation and monitor account.'
        : 'Close case after user confirmation and notify customer.';

  const analysis = {
    summary: `Rule analysis score ${score}. Amount=${tx.amount}, avg=${avg.toFixed(2)}, oddHour=${oddHour}, velocity=${velocity}.`,
    risk_level,
    recommended_action,
    timeline
  };

  await FraudReport.findByIdAndUpdate(fraudReportId, {
    $set: { ai_analysis: `${analysis.summary} | ${analysis.recommended_action}` }
  });

  return {
    ...analysis
  };
};

module.exports = {
  analyzeCase
};
