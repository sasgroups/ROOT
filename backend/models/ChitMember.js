const mongoose = require('mongoose');

const chitMemberSchema = new mongoose.Schema({
  chitGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'ChitGroup', required: true },
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  winningMonth: { type: Number },
  payments: [{
    month: Number,
    amount: Number,
    paidDate: Date,
    status: { type: String, enum: ['paid', 'pending'], default: 'pending' }
  }],
  joinedDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChitMember', chitMemberSchema);