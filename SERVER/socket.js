const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const messages = require("./models/messages")


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://chatting-app-2-4crr.onrender.com"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});


const onlineusers = {};

io.on("connection",(socket) => {
  onlineusers[socket.handshake.query.phone] = socket.id;
  io.emit("update_Online_users",Object.keys(onlineusers));
  socket.emit("get_online_users",Object.keys(onlineusers));


  socket.on("disconnect",()=>{
    delete onlineusers[socket.handshake.query.phone];
    io.emit("update_Online_users",Object.keys(onlineusers));
  })

  socket.on("Typing",(data) => {
    const {from,too} = data;
    io.to(onlineusers[too]).emit("Typing_received",from);
  })
  
  socket.on("NOT_Typing",(data)=>{
    const {from,too} = data;
    io.to(onlineusers[too]).emit("NOT_Typing_received",from);
  })

  socket.on("all_message_seen",async(data) => {
    const {from,too} = data;
    await messages.updateMany({
      from,
      to:too,
      seen:false,
    },{seen: true})
    io.to(onlineusers[too]).emit("seen",from);
  })
})


async function handlesendmessage(req,res){
  const {from,tophone,text} = req.body;
  const Msg = new messages({
    from: from,
     to: tophone,
    text: text
  })
  await Msg.save();
  io.to(onlineusers[tophone]).emit("receive-message",Msg);
  return res.json({success:true});
}


module.exports = {
    app,
    server,
    handlesendmessage
}
