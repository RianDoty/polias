const SyncHost = require("./sync");
const Room = require("./room");
const { randomCode, unregisterCode } = require("./random-code");

const noop = () => {};

class RoomManager {
  constructor(io) {
    this.io = io;
    this.rooms = new Map();
    
    this.syncHost = new SyncHost(io, "rooms");
  }

  createRoom(roomData) {
    const { code } = roomData;
    const { syncHost } = this;
    
    const newRoom = new Room(this, roomData);
    this.rooms.set(code, newRoom)
    syncHost.create(code, newRoom.template());
    
    return newRoom
  }

  destroyRoom(room) {
    const { code } = room;
    this.rooms.delete(code);
    this.syncHost.delete(code);
    unregisterCode(code)
  }

  roomExists(code) {
    return this.rooms.has(code);
  }

  findRoom(code) {
    return this.rooms.get(code);
  }
}

module.exports = (io) => new RoomManager(io);
