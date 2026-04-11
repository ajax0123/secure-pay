const mongoose = require('mongoose');
const env = require('./config/env');
require('./models/User');
const Transaction = require('./models/Transaction');

async function run() {
  try {
    await mongoose.connect(env.mongoUri);
    const tx = await Transaction.findById('69d8b6b065f173779d7a8cab')
      .populate('sender', 'name name_encrypted email email_encrypted')
      .populate('receiver', 'name name_encrypted email email_encrypted')
      .lean();
    console.log(JSON.stringify(tx, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
