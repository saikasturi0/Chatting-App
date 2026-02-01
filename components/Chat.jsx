// Enhanced Chat Component with Photos, Status, and Animations
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
import notify from "../src/assets/notify.mp3"

const url = "https://chatting-app-2-4crr.onrender.com"

const Chat = () => {
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(false); 
  const [onlineUser,setonlineUser] = useState([]);
  const [filtercontact,setFiltercontact] = useState("");
  const [filterArray,setFilterArray] = useState([]);
  const [selectedname,setSelectedname] = useState("");
  const [selectedContact,setSelectedContact] = useState("");
  const [chatArray,setChatArray] = useState([]);
  const [chatMessage,setChatMessage] = useState("");
  const [showBlur,setShowBlur] = useState(false)

  const end = useRef();
  const audioref = useRef();

  
  // show add contact 
  const [showPopup, setShowPopup] = useState(false);
  const [contactUsername, setContactUsername] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [auth,setAuth] = useState(false);
  
  const [showProfile, setShowProfile] = useState(false);
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [typing,setTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

  const selectedContactRef = useRef("");
  const phoneRef = useRef("");
  const socketRef = useRef(null);


  //Profile Picture 
    const [previewUrl, setPreviewUrl] = useState(null);
    const [selectedImage,setSelectedImage] = useState("");
    const [profileImage,setProfileImage] = useState(null);
    const [newusername,setNewusername] = useState("");
    const [showdp,setShowdp] = useState(false);
    const [dpUrl,setDpUrl] = useState("");
    const fileInputRef = useRef(null);

   const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleUploadImage = async () => {
    try {
      const response = await axios.post(
        "https://chatting-app-2-4crr.onrender.com/addImage",
        {
          name: newusername,
          image: selectedImage == "" ? "" : selectedImage,
          phoneNo: phone,      
        },
        { withCredentials: true }
      );
      console.log(response.data.url);
      setProfileImage(response.data.url);
    } catch (error) {
      console.error("Upload failed", error);
    }
    setSelectedImage("");
};


  // Helper function to get initials from name
  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };



  // Helper function to get message status class
  const getMessageStatusClass = (message) => {
    if (message.seen) return 'seen';
    if (message.delivered) return 'delivered';
    return '';
  };

  useEffect(() => {
    if (!phone) return;

    socketRef.current = io(`${url}`, {
      query: { phone },
      withCredentials: true,
    });

    socketRef.current.on("receive-message", (Msg) => {
      console.log("receive meassage")
      if(selectedContactRef.current == "") return;

      if(Msg.from == selectedContactRef.current){
        setChatArray((prev) => [...prev, {...Msg, delivered: true}]);
        socketRef.current.emit("all_message_seen",{from:phone,too:selectedContactRef.current});
        if(audioref.current){
          audioref.current.play();
        }
      }
    });

    socketRef.current.on("update_Online_users", (data) => {
      setonlineUser(data);
    });

    socketRef.current.on("get_online_users",(data) => {
      setonlineUser(data);
    })

    socketRef.current.on("Typing_received",(from) => {
      if(selectedContactRef.current == "") return;
      if(selectedContactRef.current == from) {
        console.log("typing ",from)
        setTyping(true);
      }
    });

    socketRef.current.on("NOT_Typing_received",(from) => {
      if(selectedContactRef.current == from) {
        console.log("not typing ",from)
        setTyping(false);
      }
    });

    socketRef.current.on("seen", (from) => {
      console.log("message seen");
      setChatArray(prevMessages =>
        prevMessages.map(msg => ({ ...msg, seen: true }))
      );
    });

    socketRef.current.on("delivered", (messageId) => {
      setChatArray(prevMessages =>
        prevMessages.map(msg => 
          msg.id === messageId ? { ...msg, delivered: true } : msg
        )
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
      }, 100);
    }
  }, [auth]);

  const handleSubmit = async(e) => {
    e.preventDefault();
    try {
      await axios.post(`${url}/addContacts`,{
        userPhone: phone,
        Contactname: contactUsername,
        Contactphone: contactPhone,
      }, { withCredentials: true });
      setRefreshTrigger(!refreshTrigger);
      toast.success("Contact added successfully!");
    } catch (error) {
      toast.error("Failed to add contact");
    }

    // Reset and close
    setContactUsername("");
    setContactPhone("");~
    setShowPopup(false);
  };

   const handleProfileClick = async() => {
     if(phone){
      // setSelectedImage(defaultPic)
      // console.log(selectedImage)
      const currProfile = await axios.post(`${url}/currProfile`,{phone},{withCredentials: true});
      setNewusername(currProfile.data.name);
      setProfileImage(currProfile.data.image);
    }
    setShowProfile(!showProfile);
  };

  const handleLogout = () => {
    Cookies.remove("user");
    Cookies.remove("userPhone");
    localStorage.removeItem("username");
    localStorage.removeItem("userPhone");
    toast.info("Logging out...");
    window.location.href = "/login";
  };

  //getting contacts
  const [contact,setContact] = useState([]);
  useEffect (() => {
    const fetchContacts = async () => {
      const user = localStorage.getItem("username");
      const userPhone = localStorage.getItem("userPhone");
      console.log(user," ",userPhone)
      try {
        const res = await axios.post(
          `${url}/getContacts`,
          { username: user, phone: userPhone },
          { withCredentials: true }
        );
        console.log(res.data.contacts);
        setContact(res.data.contacts);
      } catch (err) {
        console.error("Error fetching contacts:", err);
      }
    };

    if (auth) fetchContacts();
  },[refreshTrigger, auth])

  //get Messages
  async function handlegetmessages(c){
    socketRef.current.emit("all_message_seen",{from:phone,too:c.Contactphone});
    selectedContactRef.current = c.Contactphone;
    setSelectedname(c.Contactname);
    setSelectedContact(c.Contactphone);
    setPreviewUrl(c.ContactImage)
    setTyping(false); // Reset typing when switching contacts
    
    try{
        const response = await axios.post(`${url}/getMessages`,
          {
            from: phone,
            to: c.Contactphone,
          },{withCredentials: true})

            // Add delivered and seen status to existing messages
            const messagesWithStatus = response.data.Message.map(msg => ({
              ...msg,
              delivered: true,
              seen: msg.from !== phone ? true : msg.seen || false
            }));
            
            setChatArray(messagesWithStatus);
            console.log(messagesWithStatus);
            setTimeout(() => {
              end.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
    }catch (error){
      console.log("error occurred at first time messages getting",error);
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
    setTimeout(() => {
      end.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [chatArray]);

  function handleTyping(e){
    const value = e.target.value;
    setChatMessage(value);
    
    if(value.trim() === ""){
      socketRef.current.emit("NOT_Typing",{from:phone,too:selectedContact});
      return;
    }
    
    socketRef.current.emit("Typing",{from:phone,too:selectedContact});
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set new timeout to stop typing indicator after 3 seconds of inactivity
    const timeout = setTimeout(() => {
      socketRef.current.emit("NOT_Typing",{from:phone,too:selectedContact});
    }, 3000);
    
    setTypingTimeout(timeout);
  }

  useEffect(() => {
    function ESC(e){
      if(e.key === "Escape"){
        setSelectedContact("");
        setSelectedname("");
        setChatArray([]);
        selectedContactRef.current = "";
        setTyping(false);
      }
    }
    document.addEventListener("keydown",ESC);
    return () => {
      document.removeEventListener("keydown", ESC);
    };
  }, []);

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if(e.key === "Enter" && !e.shiftKey){
      e.preventDefault();
      handlesendmessage();
    }
  };


  useEffect(() => {
    const filtered = contact.filter(c =>
    c.Contactname.toLowerCase().includes(filtercontact.toLowerCase())
    )
    setFilterArray(filtered);
  }, [filtercontact, contact]);

  return (
    <>
    <div className="main-container">
      <div className="image20"> 
        <img src={logo1} alt="logo" className='chat-logo' />
        CHATTING APP
      </div>




      <div className="side-bar" style={{ filter: showBlur ? "blur(10px)" : "none" }}>
        <CgProfile className='profile-logo' onClick={handleProfileClick}/>
        <IoIosAddCircleOutline className='add-contact' onClick={handleAddContactClick} />
        <LuBrain className='ai-btn' />
      </div>
        <audio ref={audioref} src={notify} preload="auto"></audio>


      {/* contact div */}
      <div className="contacts" style={{ filter: showBlur ? "blur(10px)" : "none" }}>
        <div className='search'>
          <input type="text" placeholder='Search contact' className='search-cnt' value={filtercontact} onChange={(e) => setFiltercontact(e.target.value)}/>
        </div>
        <div>
          {(filtercontact.length ? filterArray : contact).map((c, idx) => (
            <>
              <div
                className={`contact-item-${onlineUser.includes(c.Contactphone) ? "online" : "offline"}`}
                key={idx}
                onClick={() => handlegetmessages(c)}
              >
                <div className="contact-avatar-container">
                  <div className="contact-avatar" onClick={() => setDpUrl(c.ContactImage)}>
                    <img src={c.ContactImage} alt="" className="profilePic" onClick={() => {setShowdp(true);setShowBlur(true)}}/>
                  </div>
                  {onlineUser.includes(c.Contactphone) && <div className="online-indicator"></div>}
                </div>

                <div className="contact-info" >
                  <span className="contact-name">{c.Contactname}</span>
                  <span className="contact-phone">{c.Contactphone}</span>
                  <div className="contact-status">
                    {onlineUser.includes(c.Contactphone) ? "online" : "offline"}
                  </div>
                </div>
              </div>
            </>
            ))}
        </div>
      </div>

      {showdp && (
        <div className="main-showdp" onClick={() => {setShowdp(false),setShowBlur(false)}}>
          <div className='showdp'>
            <img src={dpUrl} alt="" />  
          </div>
        </div>
      )}
      
      {/* Msg container */}

      <div className="msg-container"  onClick={() => setShowdp(false)} style={{ filter: showBlur ? "blur(10px)" : "none" }}>
        <div className='contact-name'>
          <div className="contact-avatar-container" style={{ display: selectedContact.trim() === "" ? "none" : "block" }}> 
                <div 
                  className="contact-avatar" 
                  data-name={selectedContact}
                >
                <img  src={previewUrl} alt="" className='profilePic'/>
               
                </div>
          </div>
          <p style={{padding: "10px"}}>{selectedname}</p>
        </div>
        <div className='msg'>
          {chatArray.map((c, idx) => (
            <div key={idx} 
            style={{display:"flex", flexDirection:"column"}}
              className={`${c.from === phone ? "send" : "received"} ${c.from === phone ? getMessageStatusClass(c) : ""}`}>
            <p style={{color:"black"}}>{c.text}</p>
            <p style={{color:"black"}}>{new Date(c.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          ))}


          
          {/* Typing Indicator */}
          {typing && (
            <div className="typing-indicator">
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          
          <div ref={end}></div>
        </div>
          

        <div className="btns">
          <input 
            type="text" 
            className='msg-box' 
            placeholder='Enter Your Message' 
            value={chatMessage} 
            onChange={handleTyping}
            onKeyPress={handleKeyPress}
            />
          <button className='send-btn' onClick={handlesendmessage}>Send</button>
        </div>
      </div>



      <footer style={{ filter: showBlur ? "blur(10px)" : "none" }}>
        <FaCopyright className='copyright' /> 
        <span>2025 XYZ Company. All rights reserved.</span>
      </footer>





      {/* Add Contact Popup */}
      {showPopup && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup-form" onClick={(e) => {e.stopPropagation(),setSelectedImage("")}}>
            <button 
              onClick={() => setShowPopup(false)} 
              style={{
                alignSelf: 'flex-end', 
                background: 'none', 
                border: 'none', 
                fontSize: '1.5rem', 
                cursor: 'pointer',
                color: '#ff6b6b'
              }}
            >
              ×
            </button>
            <h2 style={{marginBottom: '20px', textAlign: 'center'}}>Add New Contact</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Contact Username"
                value={contactUsername}
                onChange={(e) => setContactUsername(e.target.value)}
                required
              />
              <input
                type="tel"
                placeholder="Contact Phone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                required
                />
              <button type="submit">Add Contact</button>
            </form>
          </div>
        </div>
      )}



      {/* Profile Popup */}
      {showProfile && (
        <div className="popup-overlay" onClick={() => {setSelectedImage("")}}>
          <div className="popup-form" onClick={(e) => {e.stopPropagation()}}>
            <button 
              onClick={() => {setShowProfile(false);setSelectedImage("")}} 
              style={{
                alignSelf: 'flex-end', 
                background: 'none', 
                border: 'none', 
                fontSize: '1.5rem', 
                cursor: 'pointer',
                color: '#ff6b6b'
              }}
            >
              ×
            </button>
            <h2 style={{marginBottom: '20px', textAlign: 'center'}}>User Profile</h2>
            
            <div className="contact-avatar-container" style={{alignSelf: 'center', marginBottom: '20px'}}>
              <div 
                className="contact-avatar" 
                style={{width: '80px', height: '80px', fontSize: '24px'}}
              >
                <img 
                src={selectedImage?.trim() ? selectedImage : profileImage}
                alt="preview" 
                onClick={handleImageClick}
                style={{height:"105px",width:"105px",borderRadius:"50%",objectFit: "cover",cursor: "pointer",}}
                />

                <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleChange}
                style={{ display: "none" }}
                />
              </div>
              <div className="online-indicator"></div>
            </div>
            
            <div style={{marginBottom: '15px'}}>
              <strong style={{color: '#0ff'}}>Username:</strong>
              <input style={{color: "white", marginTop: '5px'}} onChange={(e) => setNewusername(e.target.value)} value={newusername}></input>
            </div>
            <div style={{marginBottom: '20px'}}>
              <strong style={{color: '#0ff'}}>Phone:</strong>
              <div style={{color: "white", marginTop: '5px'}} >{phone}</div>
            </div>
            <button 
              type="button" 
              className="logout-btn"
              onClick={() => handleUploadImage()}
              >
              Update
            </button>
            <button 
              type="button" 
              onClick={handleLogout} 
              className="logout-btn"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default Chat;