const mongoose = require('mongoose');

const chitGroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  monthlyContribution: { type: Number, required: true },
  durationMonths: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date }, // can be computed
  auctionDay: { type: Number, min: 1, max: 31 }, // day of month when auction occurs
  commissionPercent: { type: Number, default: 5 }, // e.g., 5%
  lateFeeAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Pre-save to compute endDate
chitGroupSchema.pre('save', function(next) {
  if (this.startDate && this.durationMonths) {
    const end = new Date(this.startDate);
    end.setMonth(end.getMonth() + this.durationMonths);
    this.endDate = end;
  }
  next();
});

module.exports = mongoose.model('ChitGroup', chitGroupSchema);