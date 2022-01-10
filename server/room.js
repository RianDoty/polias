
const SyncHost = require('./sync')
const User = require('./user')
const ChatRoomManager = require('./chat-manager')
const CardManager = require('./card-manager')

//Class to manage data storage for a room, which hosts games
class Room {
  constructor(io, code, host, manager, roomListHost, name = 'unnamed') {
    this.io = io;
    this.code = code;
    this.name = name;
    this.manager = manager;
    this.hostName = host.name;
    this.users = {}
    
    // Synchronization
    //Users: {name, cardId}
    this.usersSync = new SyncHost(io, `room users ${code}`, {});
    this.stateSync = new SyncHost(io, `room state ${code}`, {
      state: 'lobby',
      cardPack: 'fruits',
      foo: 'foo'
    });
    this.roomListSync = roomListHost
    
    // Chat
    this.chatManager = new ChatRoomManager(io, code);
    this.generateChatRooms();
    
    //Cards
    this.cardManager = new CardManager(this)
    
    this.host = host
  }
  
  join(socket) {
    const { user } = socket;
    
    if (!user) return console.log('socket does not have a user!');
    
    user.room = this;

    //Update users
    this.users[user.id] = user;
    this.usersSync.create(user.id, user.template())
    this.updatePCount()
    
    //Disconnected from site = left room
    socket.on('disconnect', ()=>this.leave(socket))
    
    //If the user is the only user in the room, give it the Host role
    if (this.pCount == 1) {
      this.assignHost(socket);
    }
    
    //Join the socket into the lobby by default
    this.chatManager.joinSocket(socket, 'lobby');   

    //Give the user a random card by default
    this.cardManager.assignCard(user);
  }
  
  leave(socket) {
    const {user} = socket
    if (!user) return console.warn('Socket with no user disconnected');
    if (!this.users[user.id]) return console.warn(`user that never existed left: ${user.id.substring(0,5)}..`); //can't have a socket that never joined leave
    console.log(`user ${user.id.substring(0,5)}.. left`)

    //Update users
    delete this.users[user.id]
    this.usersSync.delete(user.id);
    this.updatePCount();
    
    //If every user is gone, the room shouldn't exist
    
    if (this.pCount === 0) {
      //Let users join a room for a bit even if it's empty
      setTimeout(()=>{
        if (this.pCount !== 0) return;
        this.destroy();
      }, 20000)
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
      pMax: '∞' //TODO: make this actually matter
    }
  }
  
  updateList(prop, value) {
    //Updates the player list for players browsing rooms
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
    if (!socket || !socket.user) return console.warn('attempt to make invalid socket host!');
    this.host = socket;
    const { user } = socket;
    this.usersSync.update(user.id, 'host', true);
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

  destroy() {
    this.manager.destroy(this);
  }
}

module.exports = Room;