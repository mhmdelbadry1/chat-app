const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');

const Filter = require('bad-words')
const {generateMessage , generateLocation} = require('./src/utils/messages')
const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*", // Allow all origins, you can restrict this based on your frontend deployment
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling'] // Ensure WebSocket is enabled
});

const corsOptions = {
  origin: 'https://chat-7999epqu0-mhmdelbadry1s-projects.vercel.app/', // Change this to your frontend domain in production
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true
};

app.use(cors(corsOptions));


const {addUser,removeUser,getUser,getUserInRoom} = require('./src/utils/users')

const PORT = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, './public');

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
  console.log('New WebSocket connection');

  socket.on('join' , ({username , room} , callback)=>{
    const {error , user} =  addUser({id:socket.id , username , room })
    if(error){
      return callback(error)
    }
    socket.join(user.room)

    socket.emit('message', generateMessage('Welcome!' , 'Server'));
    socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!` , 'Server'));

    io.to(user.room).emit('roomData' , {
      room : user.room,
      users: getUserInRoom(user.room)
    })

    callback(undefined , socket.id)
  })


  socket.on('sendMessage', (message, callback) => {
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed!');
    }
    const user = getUser(socket.id);
    io.to(user.room).emit('message', generateMessage(message, user.username, user.room ,socket.id)); 
    callback();
  });
  
  socket.on('sendLocation', (location, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit('locationMessage', generateLocation(location, user.username, user.room,socket.id)); 
    callback();
  });
  

  socket.on('disconnect', () => {

   const user =  removeUser(socket.id)

   if(user){
     io.to(user.room).emit('message', generateMessage(`${user.username} has left!`));
      io.to(user.room).emit('roomData' , {
        room:user.room,
        users: getUserInRoom(user.room)
      })
   }


  });
});



server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


