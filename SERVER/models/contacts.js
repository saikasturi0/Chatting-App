const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  Contactname: { type: String, required: true },
  Contactphone: { type: String, required: true },
  message: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
});

module.exports = mongoose.model("Contacts", contactSchema);