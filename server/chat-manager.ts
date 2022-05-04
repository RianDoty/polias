import type Room from "./room";

//Manages chat rooms
const ChatRoom = require("./chat-room");
const BaseManager = require('./base-manager')

class ChatRoomManager extends BaseManager {
  constructor(room: Room) {
    super(room)
    
    this.rooms = new Map();
  }
  
  hasRoom(keyword: string) {
    return this.rooms.has(keyword)
  }
  
  findRoom(keyword: string) {
    return this.rooms.get(keyword)
  }

  createRoom(keyword: string) {
    this.rooms.set(keyword, new ChatRoom(this.io, keyword));
  }
}

export default ChatRoomManager;
