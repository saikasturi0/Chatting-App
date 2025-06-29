const User = require("../models/User");
const Contact = require("../models/contacts")
const twilio = require("twilio");
const messages = require("../models/messages");
require("dotenv").config();


const accountSid = process.env.Account_SID;
const authToken = process.env.Auth_Token;
const twiliophone = process.env.Twilio_Phone;
const client = twilio(accountSid, authToken);
const otpStore = {};

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ---------------------- SEND OTP ----------------------
async function sendotp(req, res) {
  const { phone } = req.body;
  const otp = generateOTP();
  otpStore[phone] = otp;
  console.log(otp);

  try {
    // await client.messages.create({
    //   body: `Your OTP is ${otp}`,
    //   from: twiliophone,
    //   to: phone,
    // });
    return res.json({ success: true, message: "OTP sent" });
  } catch (error) {
    console.error("Twilio Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
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
  console.log(username," ",phone);
  try {
    const user = await User.findOne({ phoneNo: phone }).populate("contacts");;
    if (user) {
      return res.json({ success: true, contacts: user.contacts });
    }
    return res.status(404).json({ success: false, message: "User not found" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ---------------------- ADD CONTACT ----------------------
async function addcontact(req, res) {
  console.log("add");
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

    if (existingContactDocs.length === 0) {
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
  // console.log(from, " ", to);
  // await messages.insertOne({from,to,text:"thth"});
  // await messages.insertOne({from: to,to :from,text:"thth2"});
  const Message = await messages.find({
     $or: [
      { from, to },
      { from: to, to: from }
    ]
  });
    // console.log(Message);
    return res.json({Message:Message});
}

// -----------------------send message------------------




module.exports = {
  sendotp,
  verifyotp,
  getcontacts,
  addcontact,
  handlegetmessages,
};
