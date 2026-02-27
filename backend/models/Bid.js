const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  auction: { type: mongoose.Schema.Types.ObjectId, ref: 'Auction', required: true },
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  bidAmount: { type: Number, required: true },
  isWinning: { type: Boolean, default: false },
  placedAt: { type: Date, default: Date.now },
  ipAddress: String, // for audit
});

module.exports = mongoose.model('Bid', bidSchema);