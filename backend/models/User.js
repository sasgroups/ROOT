const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { 
    type: String, 
    enum: ['admin', 'staff', 'member'], 
    default: 'member' 
  },
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' }, // if role=member, link to Member doc
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);