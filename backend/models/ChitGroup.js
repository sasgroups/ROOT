const mongoose = require('mongoose');

const chitGroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  monthlyContribution: { type: Number, required: true },
  durationMonths: { type: Number, required: true },
  startDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('ChitGroup', chitGroupSchema);