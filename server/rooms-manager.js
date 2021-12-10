const SyncHost = require("./sync");
const Room = require('./room')
const { randomCode, unregisterCode } = require("./random-code");

const rooms = {};

const noop = ()=>{};

module.exports = io => {
  const roomListSync = new SyncHost(io, "rooms");
  io.on("connection", socket => {
    socket.on("create-room", ({name: hostName}, name, ack) => {
      const code = randomCode();
      
      const newRoom = new Room(io, code, socket, roomListSync, {
        name,
        hostName
      });
      rooms[code] = newRoom;
      roomListSync.create(code, newRoom.template());
      
      //Send the host to the room
      ack(code);
    });
    
    socket.on('join room', (code, ack=noop) => {
      if (rooms[code]) rooms[code].join(socket);
      ack(true);
    })
    
    socket.on('leave room', (code) => {
      if (rooms[code]) rooms[code].leave(socket);
    })
  });
};
