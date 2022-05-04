//Manages chat rooms
const ChatRoom = require("./chat-room");
const BaseManager = require('./base-manager')

class ChatRoomManager extends BaseManager {
  constructor(room) {
    super(room)
    
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

export default ChatRoomManager;
