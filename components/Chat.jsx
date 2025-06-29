import React, { useEffect, useRef, useState } from 'react';
import {useNavigate} from "react-router-dom"
import axios from "axios"
import logo1 from "./logo.png";
import { FaCopyright } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { IoIosAddCircleOutline } from "react-icons/io";
import { LuBrain } from "react-icons/lu";
import Cookies from 'js-cookie';
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import "./Chat.css";
// import { funStore } from '../src/Store/fun';
const url = "http://localhost:5000"


const Chat = () => {
  // const {name} = funStore();
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(false); 
  const [onlineUser,setonlineUser] = useState([]);
  
  const [selectedname,setSelectedname] = useState("");
  const [selectedContact,setSelectedContact] = useState("");
  const [chatArray,setChatArray] = useState([]);
  const [chatMessage,setChatMessage] = useState("");
  const end = useRef();
  // show add contact 
  const [showPopup, setShowPopup] = useState(false);
  const [contactUsername, setContactUsername] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [auth,setAuth] = useState(false);
  
  const [showProfile, setShowProfile] = useState(false);
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [typing,setTyping] = useState(false)

  const selectedContactRef = useRef("");
  const phoneRef = useRef("");

const socketRef = useRef(null);

useEffect(() => {
  if (!phone) return;

  socketRef.current = io(`${url}`, {
    query: { phone },
    withCredentials: true,
  });

  socketRef.current.on("receive-message", (Msg) => {
    if(selectedContactRef.current == "") return;

    console.log("if");
    console.log(Msg.from," ",selectedContactRef.current);
    if(Msg.from == selectedContactRef.current){
      setChatArray((prev) => [...prev, Msg]);
      socketRef.current.emit("all_message_seen",{from:phone,too:selectedContactRef.current});
      console.log("in if");
    }
  });

  socketRef.current.on("update_Online_users", (data) => {
    console.log(data);
    setonlineUser(data);
  });

  socketRef.current.on("get_online_users",(data) => {
    setonlineUser(data);
  })

  socketRef.current.on("Typing_received",(from) => {
    if(selectedContactRef.current == "") return;
    console.log("typing ",from)
    setTyping(true);
  });

  socketRef.current.on("NOT_Typing_received",(from) => {
    console.log("typing ",from)
    setTyping(false);
  });

  socketRef.current.on("seen", (from) => {
  console.log("hello");
  setChatArray(prevMessages =>
    prevMessages.map(mas => ({ ...mas, seen: true }))
    );
  });

  // Cleanup on unmount
  return () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };
}, [phone]);
  

  const handleAddContactClick = () => {
    setShowPopup(!showPopup);
  };

useEffect(() => {
  async function getauth() {
    try {
      const result = await axios.post(`${url}/getauth`, {} , { withCredentials: true });
      if(!result.data.success) {
        toast.warn("Please login to continue");
        navigate("/login");
      } else {
        setAuth(true);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    }
  }
  if (!auth) getauth();
}, []);


useEffect(() => {
  if (auth) {
    setTimeout(() => {
      const na = localStorage.getItem("username");
      const ph = localStorage.getItem("userPhone");
      console.log("User after delay:", na, ph);
      setUsername(na);
      setPhone(ph);
    }, 100); // 100ms delay
  }
}, [auth]);

  const handleSubmit = async(e) => {
    e.preventDefault();
    await axios.post(`${url}/addContacts`,{
      userPhone: phone,
      Contactname: contactUsername,
      Contactphone: contactPhone,
    }, { withCredentials: true });
    setRefreshTrigger(!refreshTrigger);
    // Reset and close
    setContactUsername("");
    setContactPhone("");
    setShowPopup(false);
  };

  // show profile 

  const handleProfileClick = () => {
    setShowProfile(!showProfile);
  };

  const handleLogout = () => {
    Cookies.remove("user");
    Cookies.remove("userPhone");
    alert("Logging out...");
    window.location.href = "/login"; // or use useNavigate()
  };

  //adding contacts

  const [contact,setContact] = useState([]);
  useEffect (() => {
    const fetchContacts = async () => {
      const user = Cookies.get("user");
      const userPhone = Cookies.get("userPhone");
      console.log(user," ",userPhone)
      try {
        const res = await axios.post(
          `${url}/getContacts`,
          { username: user, phone: userPhone },
          { withCredentials: true }
        );
        console.log(res.conacts);
        setContact(res.data.contacts);
      } catch (err) {
        console.error("Error fetching contacts:", err);
      }
    };

    fetchContacts();
  },[refreshTrigger])

  //get Messages

  async function handlegetmessages(c){
    socketRef.current.emit("all_message_seen",{from:phone,too:c.Contactphone});
    selectedContactRef.current = c.Contactphone;
    setSelectedname(c.Contactname);
    setSelectedContact(c.Contactphone);
    try{
        const response = await axios.post(`${url}/getMessages`,
          {
            from: phone,
            to: c.Contactphone,
          },{withCredentials: true})

            setChatArray(response.data.Message);
            console.log(response.data.Message);
            end.current?.scrollIntoView({ behavior: 'smooth' });
    }catch (error){
      console.log("error occured at first time messages getting",error);
    }
  }
  

  //send messages
  async function handlesendmessage(){
    if(chatMessage.length == 0){
      toast.warn("message not be empty");
      return ;
    }
    const response = await axios.post(`${url}/sendmessage`,{from: phone,tophone: selectedContact,text: chatMessage},{withCredentials: true});
    const Message = {
      from: phone,
      to: selectedContact,
      text: chatMessage,
      seen: false,
      timestamp: Date.now(),
    }
    setChatArray(prev => [...prev, Message]);
    socketRef.current.emit("NOT_Typing",{from:phone,too:selectedContact});
    setChatMessage("");
  }

  useEffect(() => {
        end.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatArray]);

  function handleTyping(e){
    if(e.target.value == ""){
      socketRef.current.emit("NOT_Typing",{from:phone,too:selectedContact});
      return;
    }
    socketRef.current.emit("Typing",{from:phone,too:selectedContact});
    console.log("typing from: ",phone," to typing",selectedContact)
  }

  useEffect(() => {
    function ESC(e){
      if(e.key == "Escape"){
        setSelectedContact("");
        setSelectedname("");
        setChatArray([]);
        selectedContactRef.current = "";
      }
    }
    document.addEventListener("keydown",ESC);
    return () => {
      document.removeEventListener("keydown", ESC);
    };
  })

  return (
    <div className="main-container" onKeyDown={(e) => {
      if(e.key == "Enter"){
        handlesendmessage();
      }
    }}>
      <div className="image20">
        <img src={logo1} alt="logo" className='chat-logo' />
        CHATTING APP
      </div>

      <div className="side-bar">
        <CgProfile className='profile-logo' onClick={handleProfileClick}/>
        <IoIosAddCircleOutline className='add-contact' onClick={handleAddContactClick} />
        <LuBrain className='ai-btn' />
      </div>

      <div className="contacts">
        <div className='search'>
          <input type="text" placeholder='Search contact' className='search-cnt' />
        </div>
        <div>
          {contact.map((c, idx) => (
            <div className={`contact-item-${onlineUser.includes(c.Contactphone) ? "online" : "offline"}`} key={idx}
            onClick={() => handlegetmessages(c)}>
              <span className="contact-name">{c.Contactname}</span>
              <span className="contact-phone">{c.Contactphone}</span>
              <p>{onlineUser.includes(c.Contactphone) ? "online" : "offline"}</p>
              
            </div>
          ))}

        </div>
      </div>

      <div className="msg-container">
        <div className='contact-name'>{selectedname}</div>
        <div className='msg'>
          {chatArray.map((c, idx) => (
            // <div>
              <p key={idx} className={c.from === phone ? "send" : "received"}>
                {c.text}
                {c.from === phone ? (c.seen ? "seen" : "notseen") : ""}
              </p>
            
          ))}
          <p className={`${typing?'visible':'notVisible'}`}>TYPING</p>
        <div ref={end}></div>
        </div>
          
        <div className="btns">
          <input type="text" className='msg-box' placeholder='Enter Your Message' value={chatMessage} onChange={(e) => {setChatMessage(e.target.value);handleTyping(e)}} />
          <button className='send-btn' onClick={handlesendmessage}>Send</button>
        </div>
      </div>

      <footer>
        <FaCopyright className='copyright' /> <span>2025 XYZ Company. All rights reserved.</span>
      </footer>

      {/* Contact Popup */}
      {showPopup && (
        <div className="popup-form">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Contact Username"
              value={contactUsername}
              onChange={(e) => setContactUsername(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Contact Phone"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              required
            />
            <button type="submit">Add</button>
          </form>
        </div>
      )}


      {/* show - profile  */}
      {showProfile && (
        <div className="popup-form">
          <button 
            onClick={() => setShowProfile(false)} 
            style={{alignSelf: 'flex-end', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer'}}
          >
            ×
          </button>
          <h2>User Profile</h2>
          <p style={{color:"black"}}><strong>Username:</strong>{username}</p>
          <p style={{color:"black"}}><strong>Phone:</strong> {phone}</p>
          <button 
            type="button" 
            onClick={handleLogout} 
            className="logout-btn"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Chat;
