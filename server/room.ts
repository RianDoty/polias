import type User from './user'
import ChatRoomManager from './chat-manager'
import CardManager from './card-manager'
import Config from './config'
import RoomSyncManager from './room-sync-manager'
import UserManager from './user-manager'
import Base from './base'
import type RoomManager from './room-manager'
import { Namespace, Server, Socket } from 'socket.io'
import { RoomSocket } from './room-socket-types'

export interface RoomData {
  code: string
  name: string
  host: Socket
  password?: string
}

export interface RoomTemplate {
  name: string
  code: string
  hostName?: string
  password?: string
}

//Class to manage data storage for a room, which hosts games
class Room extends Base {
  io!: Namespace
  users: UserManager
  cardManager: CardManager
  chatManager: ChatRoomManager
  code: string
  password?: string
  name: string
  manager: RoomManager
  host?: User
  ioNamespace: Namespace
  gameConfig: Config
  syncManager: RoomSyncManager

  constructor(manager: RoomManager, { code, name, password } : RoomData) {
    super(manager.io)

    this.code = code
    this.name = name
    this.manager = manager
    this.password = password

    const ioNamespace = this.io.server.of(`/${this.code}`);
    this.ioNamespace = ioNamespace

    //Password Authentication
    ioNamespace.use((socket: RoomSocket, next: (err?: Error) => void) => {
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
    this.chatManager.createRooms();

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
    ioNamespace.on('connection', this.onConnection.bind(this))

    this.syncManager = new RoomSyncManager(this)
  }

  onConnection(socket: RoomSocket) {
    // socket.join(socket.userID);

    this.users.onConnection(socket)

    // socket.user = user;


    socket.on('disconnect', () => this.onDisconnect(socket))
  }

  async onDisconnect(socket: RoomSocket) {
    // const noSocketsControlling = (await this.ioNamespace.in(socket.userID).allSockets()).size === 0;

    // if (noSocketsControlling) {
    //   //Every socket authorized to control the user has left
    //   this.onUserLeave(this.getUser(socket))
    // }
  }

  template(): RoomTemplate {
    const { name, code, host } = this
    return {
      name,
      code,
      hostName: host? host.name : undefined
    }
  }

  onUserJoin(user: User) {
    

  }

  onUserLeave(user: User) {

  }

  //TODO: replace join and leave with namespaces
  join(socket: Socket) {
    //If the user is the only user in the room, give it the Host role
    // if (this.userCount == 1) {
    //   this.assignHost(socket);
    // }

    // //Join the socket into the lobby by default
    // this.chatManager.joinSocket(socket, 'lobby');

    // //Give the user a random card by default
    // this.cardManager.assignCard(user);
  }

  leave(socket: Socket) {
    // const { user } = socket
    // if (!user) return console.warn('Socket with no user disconnected');
    // if (!this.users[user.id]) return console.warn(`user that never existed left: ${user.id.substring(0, 5)}..`); //can't have a socket that never joined leave
    // console.log(`user ${user.id.substring(0, 5)}.. left`)

    // //Update users
    // delete this.users[user.id]
    // this.usersSync.delete(user.id);
    // this.updatePCount();

    // //If every user is gone, the room shouldn't exist
    // if (this.userCount === 0) {
    //   //Let users join a room for a bit even if it's empty
    //   this.noPlayersTimeout = setTimeout(() => {
    //     if (this.userCount !== 0) return;
    //     this.destroy();
    //   }, 20000)
    // }

    // //The host leaving means we have to change things up
    // if (this.isHost(socket) && this.userCount > 0) {
    //   //Pick a 'random' user
    //   const randomUser = Object.values(this.users)[0];
    //   this.assignHost(randomUser);
    // }
  }

  get userCount() {
    return this.users.userCount
  }

  // updateList(prop: string, value: any) {
  //   //Updates the player list for players browsing rooms
  //   this.roomListSync.update(this.code, prop, value);
  // }

  // Host
  isHost(user: User): boolean {
    return false //TODO: Check for this
  }

  assignHost(socket: Socket) {
    // if (!socket || !socket.user) return console.warn('attempt to make invalid socket host!');
    // this.host = socket;
    // const { user } = socket;
    // this.usersSync.update(user.id, 'host', true);
    // user.setHost(true);
  }

  destroy() {
    this.manager.destroyRoom(this);
  }

  findUser(userID: string) {
    return this.users.findUser(userID)
  }
}

export default Room;