const SyncHost = require("./sync");
const Room = require('./room')
const { randomCode, unregisterCode } = require("./random-code");
const { io } = require("socket.io-client");

const rooms = {};

const noop = ()=>{};

class RoomsManager {
  constructor(io) {
    this.io = io;
    this.rooms = {};
    this.roomListSync = new SyncHost(io, "rooms");

    this.connect();
  }

  connect() {
    this.onConnect = (socket)=>this.registerHandlers(socket)
    this.io.on('connection', this.onConnect);
  }

  registerHandlers(socket) {
    const { io, roomListSync, rooms } = this;

    socket.on("create-room", ({ name: hostName }, name, ack) => {
      const code = randomCode();

      ////Create a new room
      //const newRoom = new Room(io, code, socket, roomListSync, {
      //  name,
      //  hostName
      //});
      //rooms[code] = newRoom;
      //roomListSync.create(code, newRoom.template());
      this.createRoom(code, socket, {name, hostName})

      //Send the host to the room
      ack(code);
    });

    socket.on('join room', (code, ack = noop) => {
      if (rooms[code])
        rooms[code].join(socket);
      ack(true);
    });

    socket.on('leave room', (code) => {
      if (rooms[code])
        rooms[code].leave(socket);
    });
  }
  
  createRoom(code=randomCode(), host, roomData) {
    const { roomListSync, io } = this;
    
    //Create a new room
    const newRoom = new Room(io, code, host, roomListSync, roomData);
    rooms[code] = newRoom;
    roomListSync.create(code, newRoom.template());
  }

  close() {
    this.io.off('connection', this.onConnect);
  }
}

module.exports = RoomsManager;