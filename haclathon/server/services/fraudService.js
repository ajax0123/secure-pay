// Module: fraudService | Responsibility: Calculate transaction fraud risk scores before money movement.
const Transaction = require('../models/Transaction');
const Session = require('../models/Session');

const calculateRiskScore = async (userId, amount) => {
  // LAYER 4: Risk score calculated before every transaction
  let risk = 0;
  const now = new Date();
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

  const userTxns = await Transaction.find({
    $or: [{ sender: userId }, { receiver: userId }],
    timestamp: { $gte: last30Days },
    status: { $in: ['completed', 'flagged'] }
  }).lean();

  const total = userTxns.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  const avg = userTxns.length ? total / userTxns.length : 0;

  if (avg > 0 && amount > avg * 5) {
    risk += 40;
  }

  const recentTxns = await Transaction.countDocuments({
    sender: userId,
    timestamp: { $gte: tenMinutesAgo }
  });

  if (recentTxns > 3) {
    risk += 30;
  }

  const sessionCount = await Session.countDocuments({ user_id: userId });
  const newestSession = await Session.findOne({ user_id: userId }).sort({ login_time: -1 }).lean();
  const priorMatchingDevice = newestSession
    ? await Session.countDocuments({ user_id: userId, device: newestSession.device, _id: { $ne: newestSession._id } })
    : 0;

  const newDevice = sessionCount <= 1 || priorMatchingDevice === 0;
  if (newDevice && amount > 10000) {
    risk += 20;
  }

  return Math.min(100, risk);
};

module.exports = {
  calculateRiskScore
};
