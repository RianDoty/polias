//Manages chat rooms
const ChatRoom = require("./chat-room");

class ChatRoomManager {
  constructor(io) {
    this.io = io;
    this.rooms = new Map();
  }
  
  hasRoom(keyword) {
    return this.rooms.has(keyword)
  }
  
  findRoom(keyword) {
    return this.rooms.get(keyword)
  }

  createRoom(keyword) {
    this.rooms.set(keyword, new ChatRoom(this.io, keyword));
  }
}

module.exports = ChatRoomManager;
