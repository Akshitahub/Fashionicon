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
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600
  }
});
 
module.exports = mongoose.model('OTP', otpSchema);
 