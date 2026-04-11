const mongoose = require('mongoose');
const DisputeCase = require('./models/DisputeCase');
const { mongoUri } = require('./config/env');

(async () => {
  try {
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    const objectId = mongoose.Types.ObjectId;
    const dispute = await DisputeCase.create({
      transaction_id: objectId(),
      user_id: objectId(),
      fraud_report_id: objectId(),
      user_message: 'test message saved',
      admin_notes: 'test note',
      priority: 'normal',
      status: 'open'
    });
    console.log('created', dispute.toObject());
    const found = await DisputeCase.findById(dispute._id).lean();
    console.log('found', found);
    await DisputeCase.deleteOne({ _id: dispute._id });
    await mongoose.disconnect();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
