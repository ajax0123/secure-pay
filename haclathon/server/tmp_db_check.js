const mongoose = require('mongoose');
const env = require('./config/env');
const User = require('./models/User');
const { identityToHash, decrypt } = require('./utils/encryption');

(async () => {
  try {
    await mongoose.connect(env.mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    const users = await User.find({}).lean();
    console.log('total users', users.length);
    users.forEach((u) => {
      console.log(JSON.stringify({
        _id: u._id.toString(),
        name_hash: u.name.slice(0, 8),
        email_hash: u.email.slice(0, 8),
        name_dec: u.name_encrypted ? decrypt(u.name_encrypted) : null,
        email_dec: u.email_encrypted ? decrypt(u.email_encrypted) : null
      }));
    });
    const email = 'admin@wallet.demo';
    const user = await User.findOne({ email: identityToHash(email) }).lean();
    console.log('lookup admin by hash', !!user, user ? user._id.toString() : 'not found');
  } catch (e) {
    console.error('ERROR', e.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
})();
