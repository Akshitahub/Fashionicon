const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // auto-delete after 10 minutes
  }
});

otpSchema.index({ phone: 1 });

module.exports = mongoose.model('OTP', otpSchema);