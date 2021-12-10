//Manages a chat room, basically just a section of the chat
const SyncHost = require('./sync');

class ChatRoom {
  constructor(io, roomCode, chatKeyword) {
    const keyword = `room chat ${chatKeyword} ${roomCode}`;
    this.keyword = keyword;
    
    this.sync = new SyncHost(io, keyword);
    this.sockets = {};
    this.callbacks = new Map();
  }
  
  join(socket) {
    socket.join(this.keyword);
    this.sockets[socket.id] = socket;
    this.connect(socket)
  }
  
  leave(socket) {
    socket.leave(this.keyword);
    delete this.sockets[socket.id]
  }
  
  connect(socket) {
    const callbacks = {
      sendMessage: this.sendMessage(socket)
    }
    this.callbacks.set(socket, callbacks)
    
    socket.on(`send-message ${this.keyword}`, callbacks.sendMessage);
  }
  
  disconnect(socket) {
    const callbacks = this.callbacks.get(socket);
    
    socket.off(`send-message ${this.keyword}`, callbacks.sendMessage);
  }
  
  // Below callbacks are generators
  sendMessage(socket) {
    return (id, content) => {
      this.sync.create(id, {
        author: socket.user.template(),
        content: content
      })
    }
  }
}

module.exports = ChatRoom;