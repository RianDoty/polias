const SyncHost = require("./sync");
const Room = require('./room')
const { randomCode, unregisterCode } = require("./random-code");

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

  disconnect() {
    this.io.off('connection', this.onConnect)
    delete this.onConnect;
  }

  registerHandlers(socket) {
    socket.on("create-room", (name, ack = noop) => {
      const code = randomCode();
      const host = socket.user;

      this.createRoom(code, host, name)

      //Send the host to the room
      ack(code);
    });

    socket.on('join room', (code, ack = noop) => {
      if (this.rooms[code])
        this.rooms[code].join(socket);
      ack(true);
    });

    socket.on('leave room', (code) => {
      if (this.rooms[code])
        this.rooms[code].leave(socket);
    });
  }
  
  createRoom(code=randomCode(), host, roomData) {
    const { roomListSync, io } = this;
    
    //Create a new room
    const newRoom = new Room(io, code, host, this, roomListSync, roomData);
    this.rooms[code] = newRoom;
    roomListSync.create(code, newRoom.template());
  }

  close() {
    this.io.off('connection', this.onConnect);
  }

  destroy(room) {
    delete this.rooms[room.code]
    this.roomListSync.delete(room.code);
  }
}

module.exports = RoomsManager;