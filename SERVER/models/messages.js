// models/Message.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  from: {
    type: String,
  },
  to: {
    type: String,
  },
  text: {
    type: String,
  },
  seen: {
    type: Boolean,
    default: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Message", messageSchema);
