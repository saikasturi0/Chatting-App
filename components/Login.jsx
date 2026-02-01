import React, { useState } from 'react';
import "./Login.css";
import logo from "./logo.png";
import axios from 'axios';
import { createBrowserRouter,useNavigate, Navigate, RouterProvider, Routes } from "react-router-dom"

const url = "https://chatting-app-2-4crr.onrender.com";
const Login = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [received, setReceived] = useState(0);
  const [message, setMessage] = useState("");
  const [Username,setUsername] = useState("")
  const [realOtp,setRealOtp] = useState("")

  const sendotp = async () => {
    if (phone === "" || Username === "") {
      alert("enter proper number");
      return;
    }
    try {
      const res = await axios.post(`${url}/sendotp`, { phone }, { withCredentials: true });
      setReceived(1);
      setRealOtp(res.data.otp);
      console.log("OTP sent:", res.data.otp);
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert("Failed to send OTP. Please try again.");
    }
  }

  const verifyotp = async () => {
  try {
    const res = await axios.post(
      `${url}/verifyotp`,
      { phone, otp, Username },
      { withCredentials: true }
    );
    setMessage(res.data.message);

    if (res.data.success) {
      localStorage.setItem("username", Username);
      localStorage.setItem("userPhone", phone);
      navigate("/chatting");
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    setMessage("Failed to verify OTP. Please try again.");
  }
};


  return (
    <div className='main-container'>
      <div className='image10'>
        <img src={logo} alt="logo" className='login-logo'/>
        <p>Chatting App</p>
      </div>

      {received === 0 && (
        <div className='items-container'> 
          <h1>LOGIN</h1>
          <input 
            type="text" 
            placeholder='Username  ' 
            value={Username} 
            onChange={(e) => setUsername(e.target.value)}
          />
          <input 
            type="text" 
            placeholder='+91 ' 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)}
          />
          <button onClick={sendotp}>Send OTP</button>
        </div>
      )}  
      
      {received === 1 && (
        <div className='items-container'>
          <h1>LOGIN</h1>
          <p>Your otp is {realOtp}</p>
          <input 
            type="text" 
            placeholder='Enter OTP' 
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={verifyotp}>Verify OTP</button>
        </div>
      )}
      
      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default Login;