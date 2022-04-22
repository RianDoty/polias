//Manages a chat room, basically just a section of the chat
const SyncHost = require('./sync');

class ChatRoom {
  constructor(io, roomCode, chatKeyword) {
    const keyword = `room chat ${chatKeyword}`;

    Object.assign(this, {
      keyword,
      sync: new SyncHost(io, keyword),
      sockets: new Set(),
      callbacks: new Map()
    })
  }
  
  join(socket) {
    socket.join(this.keyword);
    this.sockets.add(socket);
    this.connect(socket)
  }
  
  leave(socket) {
    socket.leave(this.keyword);
    this.sockets.delete(socket);
    this.disconnect(socket);
  }
  
  connect(socket) {
    const callbacks = [
      [`send-message ${this.keyword}`, this.sendMessage(socket)]
    ]
    this.callbacks.set(socket, callbacks)
    
    for (const [keyword, cb] of callbacks) socket.on(keyword, cb);
  }
  
  disconnect(socket) {
    const callbacks = this.callbacks.get(socket);
    
    for (const [keyword, cb] of callbacks) socket.off(keyword, cb)
  }

  sendMessageCallback(socket) {
    return (id, content) => {
      this.sync.create(id, {
        author: socket.user.template(),
        content: content
      })
    }
  }
}

module.exports = ChatRoom;