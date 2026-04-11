import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from './server/src/models/User.ts';
import { Wallet } from './server/src/models/Wallet.ts';
import { Transaction } from './server/src/models/Transaction.ts';
import { FraudLog } from './server/src/models/FraudLog.ts';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/securepay';

const seed = async () => {
  if (process.env.CONFIRM_DB_RESET !== 'YES') {
    console.error('Seed aborted. Set CONFIRM_DB_RESET=YES to allow destructive DB reset.');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Wallet.deleteMany({});
    await Transaction.deleteMany({});
    await FraudLog.deleteMany({});

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash('password123', salt);

    // Create Users
    const alice = await User.create({
      name: 'Alice Smith',
      email: 'alice@securepay.net',
      passwordHash,
      kycStatus: 'verified'
    });

    const bob = await User.create({
      name: 'Bob Johnson',
      email: 'bob@securepay.net',
      passwordHash,
      kycStatus: 'verified'
    });

    const admin = await User.create({
      name: 'Admin Diamond',
      email: 'admin@securepay.net',
      passwordHash,
      role: 'admin'
    });

    // Create Wallets
    await Wallet.create({ userId: alice._id, balance: mongoose.Types.Decimal128.fromString('5000.00') });
    await Wallet.create({ userId: bob._id, balance: mongoose.Types.Decimal128.fromString('1200.00') });
    await Wallet.create({ userId: admin._id, balance: mongoose.Types.Decimal128.fromString('1000000.00') });

    // Create some normal transactions
    for (let i = 0; i < 5; i++) {
      await Transaction.create({
        senderId: alice._id,
        receiverId: bob._id,
        amount: mongoose.Types.Decimal128.fromString((Math.random() * 100).toFixed(2)),
        status: 'completed'
      });
    }

    // Create fraud transactions
    const fraudTx1 = await Transaction.create({
      senderId: bob._id,
      receiverId: alice._id,
      amount: mongoose.Types.Decimal128.fromString('25000.00'),
      riskScore: 0.82,
      isFlagged: true,
      status: 'completed'
    });

    await FraudLog.create({
      transactionId: fraudTx1._id,
      riskScore: 0.82,
      flags: ['new_recipient', 'high_value'],
      recommendation: 'REVIEW'
    });

    const fraudTx2 = await Transaction.create({
      senderId: alice._id,
      receiverId: bob._id,
      amount: mongoose.Types.Decimal128.fromString('120000.00'),
      riskScore: 0.98,
      isFlagged: true,
      status: 'completed'
    });

    await FraudLog.create({
      transactionId: fraudTx2._id,
      riskScore: 0.98,
      flags: ['large_amount', 'unusual_hour'],
      recommendation: 'BLOCK'
    });

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seed();
