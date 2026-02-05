const User = require("../models/User");
const Contact = require("../models/contacts")
const twilio = require("twilio");
const messages = require("../models/messages");
require("dotenv").config();
const cloudinary  = require("cloudinary").v2;

// const accountSid = process.env.Account_SID;
// const authToken = process.env.Auth_Token;
// const twiliophone = process.env.Twilio_Phone;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// const client = twilio(accountSid, authToken);
const otpStore = {};

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ---------------------- SEND OTP ----------------------
async function sendotp(req, res) {
  const { phone } = req.body;
  console.log("Phone number received:", phone);
  const otp = generateOTP();
  otpStore[phone] = otp;
  console.log(otp);

  return res.json({ success: true, message: "OTP sent", otp: otp});
  // try {
  //   // await client.messages.create({
  //   //   body: `Your OTP is ${otp}`,
  //   //   from: twiliophone,
  //   //   to: phone,
  //   // });
  // } catch (error) {
  //   console.error("Twilio Error:", error);
  //   return res.status(500).json({ success: false, message: error.message });
  // }
}

// ---------------------- VERIFY OTP ----------------------
async function verifyotp(req, res) {
  try {
    const { phone, otp, Username } = req.body;

    if (otpStore[phone] === otp) {
      delete otpStore[phone];

      res.cookie("user", Username, {
        httpOnly: true,
        maxAge: 360000000,
        sameSite: 'None',
        secure: true,
      });

      res.cookie("userPhone", phone, {
        httpOnly: true,
        maxAge: 360000000,
        sameSite: 'None',
        secure: true,
      });

      let user = await User.findOne({ phoneNo: phone });
      if (!user) {
        user = new User({
          name: Username,
          phoneNo: phone,
          contacts: [],
        });
        await user.save();
      }

      return res.json({ success: true, message: "success" });
    } else {
      return res.json({ success: false, message: "Incorrect OTP" });
    }
  } catch (err) {
    console.error("Error in verifyotp:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// ---------------------- GET CONTACTS ----------------------
async function getcontacts(req, res) {
  const { username, phone } = req.body;
  try {

    const user = await User.findOne({ phoneNo: phone }).populate("contacts");
    if(user){
      return res.json({ success: true, contacts: user.contacts });
    }
    return res.status(404).json({ success: false, message: "User not found" });
  }catch (err){
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ---------------------- ADD CONTACT ----------------------
async function addcontact(req, res) {
  const { userPhone, Contactname, Contactphone } = req.body;

  try {
    const currentUser = await User.findOne({ phoneNo: userPhone });
    const contactUser = await User.findOne({ phoneNo: Contactphone });

    if (!currentUser || !contactUser) {
      return res
        .status(404)
        .json({ success: false, message: "User or contact not found" });
    }

    // Check if contact already exists for current user
    const existingContactDocs = await Contact.find({
      _id: { $in: currentUser.contacts },
      Contactphone: Contactphone,
    });

    if(existingContactDocs.length === 0) {
      const newContact = new Contact({
        Contactname,
        Contactphone: Contactphone,
        message: [],
      });
      await newContact.save();

      currentUser.contacts.push(newContact._id);
      await currentUser.save();
    }

    // Add reverse contact entry for the other user
    const reverseExistingContactDocs = await Contact.find({
      _id: { $in: contactUser.contacts },
      Contactphone: userPhone,
    });

    if (reverseExistingContactDocs.length === 0) {
      const reverseContact = new Contact({
        Contactname: currentUser.name,
        Contactphone: currentUser.phoneNo,
        message: [],
      });
      await reverseContact.save();

      contactUser.contacts.push(reverseContact._id);
      await contactUser.save();
    }

    return res.json({ success: true, message: "Contact added successfully" });

  } catch (err) {
    console.error("Error in addcontact:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}


// -------------------------get messages ---------------------------------
async function handlegetmessages(req,res) {
  const {from,to} = req.body;
  const Message = await messages.find({
     $or: [
      { from, to },
      { from: to, to: from }
    ]
  });
    return res.json({Message:Message});
}

// ----------------------- Add Image ------------------

async function handleAddImage(req, res) {
  try { 
    const {name, image, phoneNo } = req.body;

    const contactUser = await User.findOne({phoneNo: phoneNo });

    if(contactUser.name != name){
      contactUser.name = name;
      await contactUser.save();
    }
    if(image != ""){
      // console.log("before",contactUser.image);
      const allContacts = await Contact.find({Contactphone: phoneNo });
      const result = await cloudinary.uploader.upload(image);
      for(let i=0;i<allContacts.length;i++){
        allContacts[i].ContactImage = result.secure_url;
        await allContacts[i].save();
      }
      contactUser.image = result.secure_url;
      await contactUser.save();
      // console.log("after",contactUser.image);
      return res.json({ success: true, url: result.secure_url });
    }
      return res.json({ success: true, url:contactUser.image});

  } catch (error) { 
    console.error("Upload error:", JSON.stringify(error, null, 2)); 
    return res.status(500).json({ success: false, message: "Image upload failed" });
  }
}


async function handleCurrProfile(req,res) {
   const {phone} = req.body;
   const currProfile1 = await User.find({phoneNo: phone});
   return res.json(currProfile1[0]);
}



module.exports = {  
  sendotp,
  verifyotp,
  getcontacts,
  addcontact,
  handlegetmessages,
  handleAddImage,
  handleCurrProfile,
};
