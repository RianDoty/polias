import type Room from "./room";

//Manages chat rooms
import BaseManager from './base-manager';

class ChatRoomManager extends BaseManager {
  constructor(room: Room) {
    super(room)
    
    //this.chatRooms = new Map();
  }
  
  hasRoom(keyword: string) {
    //return this.chatRooms.has(keyword)
  }
  
  findRoom(keyword: string) {
    //return this.chatRooms.get(keyword)
  }

  createRoom(keyword: string) {
    //this.chatRooms.set(keyword, new ChatRoom(this, keyword));
  }

  createRooms() {
    
  }
}

export default ChatRoomManager;
