//Manages a chat room, basically just a section of the chat
const SyncHost = require('./sync');

class ChatRoom {
  constructor(io, roomCode, chatKeyword) {
    const keyword = `room chat ${chatKeyword} ${roomCode}`;
    /** 
     * The keyword pertaining to this ChatRoom inside of its current Room. 
     * 
     * @type {string}
    */
    this.keyword = keyword;
    
    /**
     * The SyncHost that syncs the list of messages across all clients.
     * 
     * @type {SyncHost}
     */
    this.sync = new SyncHost(io, keyword);
    /**
     * The list of all Sockets connected to the ChatRoom.
     * 
     * @type {object}
     */
    this.sockets = {};
    /**
     * All of the listeners for each socket, indexed by socket objects.
     * 
     * @type {Map}
     */
    this.callbacks = new Map();
  }
  
  /**
   * Joins a socket into the room.
   * 
   * @param {Socket} socket The socket to join. 
   */
  join(socket) {
    socket.join(this.keyword);
    this.sockets[socket.id] = socket;
    this.connect(socket)
  }
  
  /**
   * Makes a socket leave the room.
   * 
   * @param {Socket} socket The socket to leave.
   */
  leave(socket) {
    socket.leave(this.keyword);
    delete this.sockets[socket.id]
    this.disconnect(socket);
  }
  
  /**
   * Connects a Socket to the ChatRoom.
   * 
   * @param {Socket} socket The Socket to connect.
   */
  connect(socket) {
    const callbacks = {
      sendMessage: this.sendMessage(socket)
    }
    this.callbacks.set(socket, callbacks)
    
    socket.on(`send-message ${this.keyword}`, callbacks.sendMessage);
  }
  
  /**
   * Disconnects a Socket from the ChatRoom.
   * 
   * @param {Socket} socket The Socket to disconnect.
   */
  disconnect(socket) {
    const callbacks = this.callbacks.get(socket);
    
    socket.off(`send-message ${this.keyword}`, callbacks.sendMessage);
  }

  // Below functions generate callbacks
  /**
   * Creates a callback for when the supplied socket wants to send a message.
   * 
   * @param {Socket} socket The socket to listen to.
   * @returns {function} The callback that sends a message from the socket when called.
   */
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