//Manages chat rooms
const ChatRoom = require('./chat-room')

class ChatRoomManager {
  constructor(io, roomCode) {
    this.io = io;
    this.roomCode = roomCode;
    
    this.rooms = {};
  }
  
  createRoom(keyword) {
    this.rooms[keyword] = new ChatRoom(this.io, this.roomCode, keyword)
  }
  
  joinSocket(socket, keyword) {
    if (!this.rooms[keyword]) return false;
    this.rooms[keyword].join(socket);
    
    socket.on('disconnect', ()=>this.leaveSocket(socket,keyword));
  }
  
  leaveSocket(socket, keyword) {
    this.rooms[keyword].leave(socket);
  }
}

module.exports = ChatRoomManager