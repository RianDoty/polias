const SyncHost = require('./sync')
const User = require('./user')
const ChatRoomManager = require('./chat-manager')
const CardManager = require('./card-manager')
const Game = require('./gameAssets/game')
const Config = require('./config')

const sleep = (ms) => new Promise(resolve => setTimeout(() => resolve(), ms))

//Class to manage data storage for a room, which hosts games
class Room {
  constructor(roomManager, {code, name, host, password}) {
    const { io, syncHost: roomListHost } = roomManager;
    
    const ioNamespace = io.of(`/${this.code}`);
    this.users = new Map();
    
    //Namespace
    ioNamespace.use((socket, next) => {
      //Verify password (if the room uses one)
      const { password } = socket.auth;
      
      if (this.password) {
        if (this.password === password) {
          return next()
        } else {
          return next(new Error('Invalid Password'))
        }
      }
      
      next()
    })
    
    // Synchronization
    //Users: {name, cardId}
    this.usersSync = new SyncHost(ioNamespace, `room users ${code}`, {});
    this.stateSync = new SyncHost(ioNamespace, `room state ${code}`, {
      state: 'lobby',
      cardPack: 'fruits'
    });
    this.roomListSync = roomListHost
    
    // Chat
    this.chatManager = new ChatRoomManager(io, code);
    this.generateChatRooms();
    
    //Cards
    this.cardManager = new CardManager(this)
    
    // Game
    this.gameConfig = new Config({
      aboutToStartTime: {
        type: 'number',
        value: 10,
        min: 0,
        max: 20
      }
    });
    
    this.onConnection = this.onConnection.bind(this);
    ioNamespace.on('connection', this.onConnected)
    
    
    Object.assign(this, {
      io,
      ioNamespace,
      code,
      name,
      roomManager,
      host,
      password,
      roomListSync: roomListHost
    })
  }

  onConnection(socket) {
    const user = this.users.get(socket.userID) || this.createUser(socket);

    socket.user = user;

    socket.on('disconnect', ()=>this.onDisconnect(socket))
  }

  async onDisconnect(socket) {
    const noSocketsControlling = (await this.ioNamespace.in(socket.userID).allSockets()).size === 0;

    if (noSocketsControlling) {
      
    }
  }

  createUser(socket) {
    //Create a new user.
    const user = User.create(socket)
    user.room = this;

    this.usersSync.create(user.id, user.template())
    this.users.set(user.id, user)
    this.updatePCount()
    this.bind(user)

    if (this.noPlayersTimeout) {
      //Someone's in the room now, so the room shouldn't be destroyed
      clearTimeout(this.noPlayersTimeout)
      this.noPlayersTimeout = null;
    };

    socket.join(user.id)
  }
  
  //TODO: replace join and leave with namespaces
  join(socket) {
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
      this.noPlayersTimeout = setTimeout(()=>{
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
  
  listen(socket) {
    socket.on('start-game-request', () => {
      if (!this.isHost(socket)) return;
      this.startGame();
    })
  }
  
  get pCount() {
    return this.users.size
  }
  
  template() {
    return {
      name: this.name,
      code: this.code,
      hostName: this.host.username,
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
    user.setHost(true);
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

  bind(user) {
    user.on('changed', this.onChange)
  }

  unbind(user) {
    user.off('changed', this.onChange)
  }
  
  // Game
  async startGame() {
    const toStartTime = this.gameConfig.get('aboutToStartTime')
    this.ioRoom.emit('game-about-to-start', toStartTime);
    await sleep(toStartTime*1000);
    
    //Create and start a game
    const game = new Game(this, this.gameConfig)
    this.game = game;
    game.start();
  }

  destroy() {
    this.manager.destroy(this);
    Object.values(this.users).forEach(u => this.unbind(u))
  }
}

module.exports = Room;