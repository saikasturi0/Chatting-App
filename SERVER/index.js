const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const {app,server,handlesendmessage} = require("./socket")
const { verifyotp, sendotp, getcontacts, addcontact, handlegetmessages, handleAddImage, handleCurrProfile } = require("./controllers/login_urls");
require('dotenv').config();


// Connect to MongoDB
mongoose.connect(process.env.mongoose_connect)
  .then(() => console.log("connected to mongodb"))
  .catch((err) => console.log(err));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware
app.use(cors({
  origin: ['http://localhost:5173',
    'https://chatting-app-2-4crr.onrender.com'
  ],
  credentials: true
}));


const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());


// Routes
app.get('/',(req,res)=>{
  res.send("Hello");
})
app.post("/sendotp", sendotp);
app.post("/verifyotp", verifyotp);
app.post("/getauth", (req, res) => {
  const token = req.cookies.user;
  // console.log("User Cookie:", req.cookies.user);
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
app.post("/addImage",handleAddImage);
app.post("/currProfile",handleCurrProfile);



// Fallback for unknown routes (optional but good)
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log("server started at port 5000");
});
