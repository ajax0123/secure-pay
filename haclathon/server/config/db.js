// Module: db | Responsibility: Establish and manage MongoDB connection.
const mongoose = require('mongoose');
const env = require('./env');

let mongod = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    console.log('MongoDB already connected');
    return;
  }
  try {
    const dns = require('dns');
    dns.setServers(['8.8.8.8']); // Fix Windows node SRV resolution
    await mongoose.connect(env.mongoUri, { autoIndex: true });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.warn('Failed to connect to primary MongoDB (likely IP Whitelist issue). Falling back to Memory Server...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri, { autoIndex: true });
    console.log('Connected to fallback MongoDB Memory Server');
    // Run seed to ensure mock users exist
    try {
      process.env.CONFIRM_DB_RESET = 'YES';
      const seedData = require('../seed');
      if (typeof seedData === 'function') await seedData();
    } catch (e) { console.error('Seed error', e.message); }
  }
};

module.exports = connectDB;
