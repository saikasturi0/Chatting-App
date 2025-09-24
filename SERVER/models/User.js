const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  phoneNo: String,
  image: {type: String,default: "https://res.cloudinary.com/depx1ruxw/image/upload/v1752687510/ieerevpowenu8wwjsw6f.webp"},
  contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Contacts" }],
});

module.exports = mongoose.model("User", userSchema);