// Module: auditLogger | Responsibility: Persist immutable-like audit entries for security-sensitive actions.
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    event_type: {
      type: String,
      enum: ['LOGIN', 'TRANSACTION', 'FRAUD_REPORT', 'ACCOUNT_FREEZE', 'PIN_FAIL'],
      required: true,
      index: true
    },
    metadata: { type: Object, default: {} },
    first_seen_at: { type: Date, default: Date.now },
    last_seen_at: { type: Date, default: Date.now },
    hit_count: { type: Number, default: 1 }
  },
  { versionKey: false }
);

auditLogSchema.index({ user_id: 1, event_type: 1, 'metadata.fingerprint': 1 }, { unique: true, sparse: true });

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);

const logEvent = async (userId, eventType, metadata = {}) => {
  // LAYER 5: All sensitive actions create an immutable audit log entry
  const fingerprint = metadata.fingerprint || null;
  if (!fingerprint) {
    await AuditLog.create({ user_id: userId, event_type: eventType, metadata });
    return;
  }

  await AuditLog.findOneAndUpdate(
    { user_id: userId, event_type: eventType, 'metadata.fingerprint': fingerprint },
    {
      $setOnInsert: {
        user_id: userId,
        event_type: eventType,
        metadata: { ...metadata, fingerprint },
        first_seen_at: new Date()
      },
      $set: { last_seen_at: new Date() },
      $inc: { hit_count: 1 }
    },
    { upsert: true, new: true }
  );
};

module.exports = {
  logEvent,
  AuditLog
};
