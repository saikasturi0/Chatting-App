const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const {app,server,handlesendmessage} = require("./socket")
const { verifyotp, sendotp, getcontacts, addcontact, handlegetmessages } = require("./controllers/login_urls");
require('dotenv').config();


// Connect to MongoDB
mongoose.connect(process.env.mongoose_connect)
  .then(() => console.log("connected to mongodb"))
  .catch((err) => console.log(err));

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.post("/sendotp", sendotp);
app.post("/verifyotp", verifyotp);
app.post("/getauth", (req, res) => {
  const token = req.cookies.user;
  console.log("User Cookie:", req.cookies.user);
  if (token) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});
app.post("/getContacts", getcontacts);
app.post("/addContacts", addcontact);
app.post("/getmessages",handlegetmessages);
app.post("/sendmessage",handlesendmessage)



// io.on("receive-message",)

// Fallback for unknown routes (optional but good)
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Start server
server.listen(5000, () => {
  console.log("server started at port 5000");
});
