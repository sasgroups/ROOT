const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // link to User if registered
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: String,
  address: String,
  nomineeName: String,
  nomineeRelation: String,
  kycDocument: String, // path to uploaded file
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Member', memberSchema);