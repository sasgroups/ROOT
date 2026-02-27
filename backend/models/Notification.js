const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
  type: { type: String, enum: ['email', 'sms', 'push'], required: true },
  title: String,
  body: String,
  status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
  sentAt: Date,
  error: String,
});

module.exports = mongoose.model('Notification', notificationSchema);