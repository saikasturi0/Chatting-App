const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
  },
  otp: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    expires: 300 // 5 mins
  },
});

module.exports = mongoose.model("OTP", otpSchema);
