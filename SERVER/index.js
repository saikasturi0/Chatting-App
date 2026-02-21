const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const { app, server, handlesendmessage } = require("./socket");
const {
  verifyotp,
  sendotp,
  getcontacts,
  addcontact,
  handlegetmessages,
  handleAddImage,
  handleCurrProfile
} = require("./controllers/login_urls");

// =======================
// ✅ CONNECT TO MONGODB USING MONGOOSE
// =======================

mongoose.connect(process.env.mongoose_connect)
  .then(() => {
    console.log("DB connected successfully");

    // Start server ONLY after DB connects
    server.listen(process.env.PORT || 5000, () => {
      console.log("Server started at port", process.env.PORT || 5000);
    });

  })
  .catch((err) => {
    console.error("DB connection failed:", err);
    process.exit(1);
  });


// =======================
// MIDDLEWARE
// =======================

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://chatting-app-2-4crr.onrender.com"
  ],
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());


// =======================
// CLOUDINARY CONFIG
// =======================

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


// =======================
// ROUTES
// =======================

app.get("/", (req, res) => {
  res.send("Hello");
});

app.post("/sendotp", sendotp);
app.post("/verifyotp", verifyotp);
app.post("/getauth", (req, res) => {
  const token = req.cookies.user;
  console.log(token);
  if (token) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

app.post("/getContacts", getcontacts);
app.post("/addContacts", addcontact);
app.post("/getmessages", handlegetmessages);
app.post("/sendmessage", handlesendmessage);
app.post("/addImage", handleAddImage);
app.post("/currProfile", handleCurrProfile);


// =======================
// 404 HANDLER
// =======================

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});
