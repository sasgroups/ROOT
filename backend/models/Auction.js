const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  chitGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'ChitGroup', required: true },
  monthNumber: { type: Number, required: true }, // which month's auction
  auctionDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'], 
    default: 'scheduled' 
  },
  winnerMember: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' }, // set when completed
  winningBidAmount: Number, // the bid amount
  discount: Number, // totalAmount - winningBidAmount
  commissionAmount: Number, // discount * commissionPercent / 100
  netDiscount: Number, // discount - commissionAmount
  dividendPerMember: Number, // netDiscount / totalMembers (excluding winner? depends on rules)
  bids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bid' }], // optional: reference bids
  finalizedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  finalizedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Auction', auctionSchema);