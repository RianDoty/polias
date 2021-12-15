
const SyncHost = require('./sync')
const User = require('./user')
const ChatRoomManager = require('./chat-manager')
const CardManager = require('./card-manager')

//Class to manage data storage for a room, which hosts games
class Room {
  constructor(io, code, host, roomListHost, {name = 'unnamed', hostName = 'unnamed'} = {}) {
    this.io = io;
    this.code = code;
    this.name = name;
    this.hostName = hostName;
    this.users = {}
    
    // Synchronization
    //Users: {name, cardID}
    this.usersSync = new SyncHost(io, `room users ${code}`, {});
    this.stateSync = new SyncHost(io, `room state ${code}`, {
      state: 'lobby'
    });
    this.roomListSync = roomListHost
    
    // Chat
    this.chatManager = new ChatRoomManager(io, code);
    this.generateChatRooms();
    
    //Cards
    this.cardManager = new CardManager(io)
    
    this.host = host
  }
  
  join(socket) {
    const { user } = socket;
    
    if (!user) return console.log('socket does not have a user!');
    
    //Update users
    this.users[socket.id] = socket.user;
    
    //Synchronization
    this.usersSync.create(socket.id, user.template())
    this.updatePCount()
    
    //Disconnected from site = left room
    socket.once('disconnect', ()=>this.leave(socket))
    
    //If the user is the only user in the room, give it the Host role
    if (this.pCount == 1) {
      this.assignHost(socket);
    }
    
    //Join the socket into the lobby by default
    this.chatManager.joinSocket(socket, 'lobby');
    
    //Give the user a random card by default
    this.cardManager.assignCard(socket);
  }
  
  leave(socket) {
    if (!this.users[socket.id]) return; //can't have a socket that never joined leave
    
    //Update users
    delete this.users[socket.id]
    this.usersSync.delete(socket.id);
    this.updatePCount();
    
    //If every user is gone, the room shouldn't exist
    //Let users join a room for a bit even if it's empty
    if (this.pCount == 0) {
      
    }
    
    //The host leaving means we have to change things up
    if (this.isHost(socket) && this.pCount > 0) {
      //Pick a 'random' user
      const randomUser = Object.values(this.users)[0];
      this.assignHost(randomUser);
    }
  }
  
  get pCount() {
    const count = Object.keys(this.users).length;
    return  count;
  }
  
  template() {
    return {
      name: this.name,
      code: this.code,
      hostName: this.hostName,
      pCount: this.pCount,
      pMax: '∞'
    }
  }
  
  updateList(prop, value) {
    this.roomListSync.update(this.code, prop, value);
  }
  
  updatePCount() { 
    this.updateList('pCount', this.pCount)
  }
  
  // Host
  isHost(socket) {
    return (socket.id === this.host.id);
  }
  
  assignHost(socket) {
    this.host = socket;
    this.usersSync.update(socket.id, 'host', true);
  }
  
  // Chat
  generateChatRooms() {
    this.chatManager.createRoom('lobby')
  }
  
  // Cards
  changeCardPack(requester, pack) {
    //Only the host should be able to change the pack
    if (!requester.hasAdmin()) return false;
    
    
  }
}

module.exports = Room;