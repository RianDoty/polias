import User from './user'
import ChatRoomManager from './chat-manager'
import CardManager from './card-manager'
import Config from './config'
import RoomSyncManager from './room-sync-manager'
import UserManager from './user-manager'
import Base from './base'
import type { RoomManager } from './room-manager'
import type { Namespace, Socket } from 'socket.io'

export interface RoomData {
  code: string
  name: string
  host: Socket
  password?: string
}

//Class to manage data storage for a room, which hosts games
class Room extends Base {
  users: UserManager
  cardManager: CardManager
  chatManager: ChatRoomManager
  code: string
  password?: string
  name: string
  manager: RoomManager
  host: Socket
  ioNamespace: Namespace
  gameConfig: Config
  syncManager: RoomSyncManager

  constructor(manager: RoomManager, { code, name, host, password } : RoomData) {
    super(manager.io)

    this.code = code
    this.name = name
    this.manager = manager
    this.host = host
    this.password = password

    const ioNamespace = this.io.of(`/${this.code}`);
    this.ioNamespace = ioNamespace

    //Password Authentication
    ioNamespace.use((socket, next) => {
      const { password } = socket.handshake.auth;

      if (this.password) {
        if (this.password !== password) {
          return next(new Error('Invalid Password'))
        }
      }

      next()
    })

    this.users = new UserManager(this)

    this.chatManager = new ChatRoomManager(this);
    this.chatManager.generateChatRooms();

    this.cardManager = new CardManager(this)

    this.gameConfig = new Config({
      aboutToStartTime: {
        type: 'number',
        value: 10,
        min: 0,
        max: 20
      }
    });

    this.onConnection = this.onConnection.bind(this);
    ioNamespace.on('connection', this.onConnection)

    this.syncManager = new RoomSyncManager(this)
  }

  onConnection(socket) {
    socket.join(socket.userID);

    // Find/create user
    const user = this.findUser(socket.userID)
    if (!user) {
      user = User.create(socket)

      this.onUserJoin(user)
    }

    socket.user = user;
    socket.on('disconnect', () => this.onDisconnect(socket))
  }

  async onDisconnect(socket) {
    const noSocketsControlling = (await this.ioNamespace.in(socket.userID).allSockets()).size === 0;

    if (noSocketsControlling) {
      //Every socket authorized to control the user has left
      this.onUserLeave(this.getUser(socket))
    }
  }

  onUserJoin(user) {
    

  }

  onUserLeave(user) {

  }

  //TODO: replace join and leave with namespaces
  join(socket) {
    //If the user is the only user in the room, give it the Host role
    if (this.userCount == 1) {
      this.assignHost(socket);
    }

    //Join the socket into the lobby by default
    this.chatManager.joinSocket(socket, 'lobby');

    //Give the user a random card by default
    this.cardManager.assignCard(user);
  }

  leave(socket) {
    const { user } = socket
    if (!user) return console.warn('Socket with no user disconnected');
    if (!this.users[user.id]) return console.warn(`user that never existed left: ${user.id.substring(0, 5)}..`); //can't have a socket that never joined leave
    console.log(`user ${user.id.substring(0, 5)}.. left`)

    //Update users
    delete this.users[user.id]
    this.usersSync.delete(user.id);
    this.updatePCount();

    //If every user is gone, the room shouldn't exist
    if (this.userCount === 0) {
      //Let users join a room for a bit even if it's empty
      this.noPlayersTimeout = setTimeout(() => {
        if (this.userCount !== 0) return;
        this.destroy();
      }, 20000)
    }

    //The host leaving means we have to change things up
    if (this.isHost(socket) && this.userCount > 0) {
      //Pick a 'random' user
      const randomUser = Object.values(this.users)[0];
      this.assignHost(randomUser);
    }
  }

  get userCount() {
    return this.users.size
  }

  updateList(prop, value) {
    //Updates the player list for players browsing rooms
    this.roomListSync.update(this.code, prop, value);
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

  destroy() {
    this.manager.destroy(this);
    Object.values(this.users).forEach(u => this.unbind(u))
  }

  findUser(userID) {
    return this.users.get(userID)
  }
}

export default Room;