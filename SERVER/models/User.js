const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  phoneNo: String,
  contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Contacts" }],
});

module.exports = mongoose.model("User", userSchema);