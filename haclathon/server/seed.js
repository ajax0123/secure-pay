// Module: seed | Responsibility: Seed admin and demo users with sample encrypted wallet balances, cases, and audit history.
const bcrypt = require('bcrypt');

const connectDB = require('./config/db');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const FraudReport = require('./models/FraudReport');
const DisputeCase = require('./models/DisputeCase');
const Session = require('./models/Session');
const { AuditLog } = require('./services/auditLogger');
const { analyzeCase } = require('./services/investigationService');
const { encrypt, identityToHash } = require('./utils/encryption');

const SALT_ROUNDS = 12;
const BASE_TIME = new Date('2026-04-08T09:00:00.000Z');

const offsetMinutes = (minutes) => new Date(BASE_TIME.getTime() + minutes * 60 * 1000);

const seedAuditLog = async (userId, eventType, metadata, time) => {
  await AuditLog.create({
    user_id: userId,
    event_type: eventType,
    metadata,
    first_seen_at: time,
    last_seen_at: time,
    hit_count: 1
  });
};

const run = async () => {
  if (process.env.CONFIRM_DB_RESET !== 'YES') {
    console.error('Seed aborted. Set CONFIRM_DB_RESET=YES to allow destructive DB reset.');
    process.exit(1);
  }

  await connectDB();

  await Promise.all([
    Transaction.deleteMany({}),
    FraudReport.deleteMany({}),
    DisputeCase.deleteMany({}),
    Session.deleteMany({}),
    AuditLog.deleteMany({}),
    User.deleteMany({ email: { $in: [identityToHash('admin@wallet.demo'), identityToHash('alice@wallet.demo'), identityToHash('bob@wallet.demo'), identityToHash('carol@wallet.demo')] } })
  ]);

  const adminPassword = await bcrypt.hash('Admin@123', SALT_ROUNDS);
  const adminPin = await bcrypt.hash('1111', SALT_ROUNDS);
  const alicePassword = await bcrypt.hash('Alice@123', SALT_ROUNDS);
  const alicePin = await bcrypt.hash('1234', SALT_ROUNDS);
  const bobPassword = await bcrypt.hash('Bob@123', SALT_ROUNDS);
  const bobPin = await bcrypt.hash('5678', SALT_ROUNDS);
  const carolPassword = await bcrypt.hash('Carol@123', SALT_ROUNDS);
  const carolPin = await bcrypt.hash('9012', SALT_ROUNDS);

  const adminName = 'Admin User';
  const adminEmail = 'admin@wallet.demo';
  const aliceName = 'Alice';
  const aliceEmail = 'alice@wallet.demo';
  const bobName = 'Bob';
  const bobEmail = 'bob@wallet.demo';
  const carolName = 'Carol';
  const carolEmail = 'carol@wallet.demo';

  const admin = await User.create({
    name: identityToHash(adminName),
    email: identityToHash(adminEmail),
    name_encrypted: encrypt(adminName),
    email_encrypted: encrypt(adminEmail),
    password_hash: adminPassword,
    transaction_pin_hash: adminPin,
    wallet_balance_encrypted: encrypt('100000'),
    kyc_verified: true,
    role: 'admin'
  });

  const alice = await User.create({
    name: identityToHash(aliceName),
    email: identityToHash(aliceEmail),
    name_encrypted: encrypt(aliceName),
    email_encrypted: encrypt(aliceEmail),
    password_hash: alicePassword,
    transaction_pin_hash: alicePin,
    wallet_balance_encrypted: encrypt('50000'),
    kyc_verified: true,
    role: 'user'
  });

  const bob = await User.create({
    name: identityToHash(bobName),
    email: identityToHash(bobEmail),
    name_encrypted: encrypt(bobName),
    email_encrypted: encrypt(bobEmail),
    password_hash: bobPassword,
    transaction_pin_hash: bobPin,
    wallet_balance_encrypted: encrypt('30000'),
    kyc_verified: true,
    role: 'user'
  });

  const carol = await User.create({
    name: identityToHash(carolName),
    email: identityToHash(carolEmail),
    name_encrypted: encrypt(carolName),
    email_encrypted: encrypt(carolEmail),
    password_hash: carolPassword,
    transaction_pin_hash: carolPin,
    wallet_balance_encrypted: encrypt('20000'),
    kyc_verified: true,
    role: 'user'
  });

  const aliceSessionTime = offsetMinutes(-45);
  const bobSessionTime = offsetMinutes(-40);
  const carolSessionTime = offsetMinutes(-35);

  await Session.create([
    {
      user_id: alice._id,
      device: 'Laptop',
      browser: 'Chrome',
      ip_address: '10.0.0.11',
      location: 'Mumbai, IN',
      login_time: aliceSessionTime,
      last_active: offsetMinutes(180),
      is_active: true
    },
    {
      user_id: bob._id,
      device: 'Mobile',
      browser: 'Safari',
      ip_address: '10.0.0.22',
      location: 'Pune, IN',
      login_time: bobSessionTime,
      last_active: offsetMinutes(180),
      is_active: true
    },
    {
      user_id: carol._id,
      device: 'Tablet',
      browser: 'Firefox',
      ip_address: '10.0.0.33',
      location: 'Delhi, IN',
      login_time: carolSessionTime,
      last_active: offsetMinutes(180),
      is_active: true
    }
  ]);

  await seedAuditLog(alice._id, 'LOGIN', { device: 'Laptop', browser: 'Chrome', ip: '10.0.0.11' }, aliceSessionTime);
  await seedAuditLog(bob._id, 'LOGIN', { device: 'Mobile', browser: 'Safari', ip: '10.0.0.22' }, bobSessionTime);

  const txSpecs = [
    { sender: alice, receiver: bob, amount: 1500, minute: 0 },
    { sender: bob, receiver: alice, amount: 750, minute: 30 },
    { sender: alice, receiver: carol, amount: 2200, minute: 60 },
    { sender: carol, receiver: alice, amount: 1800, minute: 90 },
    { sender: bob, receiver: carol, amount: 3200, minute: 120 },
    { sender: carol, receiver: bob, amount: 1100, minute: 150 },
    { sender: alice, receiver: bob, amount: 4100, minute: 180 },
    { sender: bob, receiver: alice, amount: 1400, minute: 210 },
    { sender: carol, receiver: alice, amount: 2700, minute: 240 },
    { sender: alice, receiver: carol, amount: 900, minute: 270 }
  ];

  const transactions = [];
  for (let index = 0; index < txSpecs.length; index += 1) {
    const spec = txSpecs[index];
    const timestamp = offsetMinutes(spec.minute);
    const transaction = await Transaction.create({
      sender: spec.sender._id,
      receiver: spec.receiver._id,
      amount: spec.amount,
      encrypted_payload: encrypt(JSON.stringify({
        reference: `SEED-TXN-${index + 1}`,
        note: `Seed transaction ${index + 1}`,
        initiated_at: timestamp.toISOString()
      })),
      risk_score: index === 4 ? 68 : index === 7 ? 32 : 18,
      status: 'completed',
      timestamp
    });

    transactions.push(transaction);

    await seedAuditLog(spec.sender._id, 'TRANSACTION', {
      fingerprint: `seed-${transaction._id}-debit`,
      transactionId: transaction._id.toString(),
      direction: 'debit',
      amount: spec.amount
    }, timestamp);

    await seedAuditLog(spec.receiver._id, 'TRANSACTION', {
      fingerprint: `seed-${transaction._id}-credit`,
      transactionId: transaction._id.toString(),
      direction: 'credit',
      amount: spec.amount
    }, timestamp);
  }

  const openFraudTransaction = transactions[4];
  const resolvedFraudTransaction = transactions[7];

  const openFraudReport = await FraudReport.create({
    transaction_id: openFraudTransaction._id,
    reported_by: alice._id,
    reason: 'Unrecognized high-value transfer while locked screen was unattended.',
    ai_analysis: '',
    risk_score: 72,
    status: 'open',
    created_at: offsetMinutes(125)
  });

  await seedAuditLog(alice._id, 'FRAUD_REPORT', {
    fingerprint: `fraud-${openFraudReport._id}`,
    transactionId: openFraudTransaction._id.toString(),
    reason: 'Unrecognized high-value transfer while locked screen was unattended.'
  }, offsetMinutes(125));

  const resolvedFraudReport = await FraudReport.create({
    transaction_id: resolvedFraudTransaction._id,
    reported_by: bob._id,
    reason: 'Duplicate merchant settlement already resolved by support.',
    ai_analysis: '',
    risk_score: 28,
    status: 'resolved',
    created_at: offsetMinutes(215)
  });

  await seedAuditLog(bob._id, 'FRAUD_REPORT', {
    fingerprint: `fraud-${resolvedFraudReport._id}`,
    transactionId: resolvedFraudTransaction._id.toString(),
    reason: 'Duplicate merchant settlement already resolved by support.'
  }, offsetMinutes(215));

  await analyzeCase(openFraudReport._id);
  await analyzeCase(resolvedFraudReport._id);

  await DisputeCase.create({
    transaction_id: openFraudTransaction._id,
    user_id: alice._id,
    fraud_report_id: openFraudReport._id,
    user_message: 'Please review this unauthorized transfer.',
    admin_notes: 'Awaiting supporting evidence from user.',
    status: 'open',
    created_at: offsetMinutes(130)
  });

  console.log('Seed completed.');
  console.log('Admin email: admin@wallet.demo / Admin@123');
  console.log('Alice email: alice@wallet.demo / Alice@123');
  console.log('Bob email: bob@wallet.demo / Bob@123');
  console.log('Carol email: carol@wallet.demo / Carol@123');
  return true;
};

if (require.main === module) {
  run().then(() => process.exit(0)).catch((error) => {
    console.error('Seed failed:', error.message);
    process.exit(1);
  });
}

module.exports = run;
