const mongoose = require('mongoose');

const ledgerEntrySchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  chitGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'ChitGroup' }, // optional
  transactionDate: { type: Date, default: Date.now },
  description: String,
  debit: { type: Number, default: 0 },
  credit: { type: Number, default: 0 },
  balance: Number, // running balance (can be computed)
  referenceId: { type: mongoose.Schema.Types.ObjectId }, // e.g., subscription, auction, dividend
  referenceModel: String, // 'Subscription', 'Auction', 'Dividend', etc.
});

module.exports = mongoose.model('LedgerEntry', ledgerEntrySchema);