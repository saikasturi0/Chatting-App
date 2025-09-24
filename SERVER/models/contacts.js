const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  Contactname: { type: String, required: true },
  Contactphone: { type: String, required: true },
  ContactImage: {type: String,default: "https://res.cloudinary.com/depx1ruxw/image/upload/v1752687510/ieerevpowenu8wwjsw6f.webp"},
  message: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
});

module.exports = mongoose.model("Contacts", contactSchema);