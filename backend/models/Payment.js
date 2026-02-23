const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  chitGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'ChitGroup', required: true },
  chitMember: { type: mongoose.Schema.Types.ObjectId, ref: 'ChitMember', required: true },
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  month: { type: Number, required: true },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  remarks: String,
});

module.exports = mongoose.model('Payment', paymentSchema);
