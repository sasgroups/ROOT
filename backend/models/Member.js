const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: String,
  address: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Member', memberSchema);