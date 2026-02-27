const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  chitGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'ChitGroup', required: true },
  chitMember: { type: mongoose.Schema.Types.ObjectId, ref: 'ChitMember', required: true },
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  monthNumber: { type: Number, required: true }, // 1..durationMonths
  dueDate: { type: Date, required: true },
  amount: { type: Number, required: true }, // usually monthlyContribution
  status: { 
    type: String, 
    enum: ['pending', 'paid', 'partially_paid', 'late', 'waived'], 
    default: 'pending' 
  },
  paidAmount: { type: Number, default: 0 },
  lateFee: { type: Number, default: 0 },
  paidDate: Date,
  paymentMethod: String, // cash, bank, UPI, etc.
  transactionId: String,
  remarks: String,
}, { timestamps: true });

// Ensure unique per chitMember+monthNumber
subscriptionSchema.index({ chitMember: 1, monthNumber: 1 }, { unique: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);