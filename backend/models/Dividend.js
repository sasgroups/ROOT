const mongoose = require('mongoose');

const dividendSchema = new mongoose.Schema({
  auction: { type: mongoose.Schema.Types.ObjectId, ref: 'Auction', required: true },
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  amount: { type: Number, required: true },
  distributedDate: { type: Date, default: Date.now },
  adjustmentType: { 
    type: String, 
    enum: ['cash', 'adjust_next_subscription'], 
    default: 'cash' 
  },
  remarks: String,
});

module.exports = mongoose.model('Dividend', dividendSchema);