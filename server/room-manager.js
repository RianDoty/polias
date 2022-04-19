const SyncHost = require("./sync");
const Room = require("./room");
const { randomCode, unregisterCode } = require("./random-code");

const noop = () => {};

class RoomsManager {
  constructor(io) {
    this.io = io;
    this.rooms = new Map();
    this.syncHost = new SyncHost(io, "rooms");
  }

  registerHandlers(socket) {
    const onCreateRoom = (name, ack = noop) => {
      const code = randomCode();
      const host = socket.user;

      this.createRoom(code, host, name);

      //Send the host to the room
      ack(code);
    };

    socket.on("create-room", onCreateRoom);
  }

  createRoom(code = randomCode(), host, roomData) {
    const { roomListSync, io } = this;

    const newRoom = new Room(io, code, host, this, roomListSync, roomData);
    this.rooms[code] = newRoom;
    roomListSync.create(code, newRoom.template());
  }

  destroy(room) {
    this.rooms.delete(room.code);
    this.syncHost.delete(room.code);
  }

  roomExists(code) {
    return this.rooms.has(code);
  }

  getRoom(code) {
    return this.rooms.get(code);
  }
}

module.exports = (io) => new RoomsManager(io);
