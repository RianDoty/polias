import type User from "./user";
import debugNSP from "./nspdebug";
import Config from "./config";
import RoomSyncManager from "./room-sync-manager";
import UserManager from "./user-manager";
import Base from "./base";
import type RoomManager from "./room-manager";
import { Namespace, Socket } from "socket.io";
import { EventEmitter } from "events";

export interface RoomData {
  code: string;
  name?: string;
  host?: Socket;
  password?: string;
}

export interface RoomParameters {
  name: string;
  password?: string;
}

export interface RoomTemplate {
  name: string;
  code: string;
  hostName: string;
  password: string;
  pCount: number;
  pMax: number;
}

const baseConfigData = {
  aboutToStartTime: {
    type: "number",
    default: 10,
    min: 0,
    max: 20
  }
} as const;

//Class to manage data storage for a room, which hosts games
class Room extends Base {
  users: UserManager;
  code: string;
  password?: string;
  name: string;
  manager: RoomManager;
  host?: User;
  nsp: Namespace;
  gameConfig: Config<typeof baseConfigData>;
  syncManager: RoomSyncManager;
  events: EventEmitter;

  constructor(
    manager: RoomManager,
    { code, name = "Unnamed", password }: RoomData
  ) {
    super(manager.io);

    this.code = code;
    this.name = name;
    this.manager = manager;
    this.password = password;
    this.events = new EventEmitter();

    const nsp = this.io.server.of(`${this.io.name}${this.code}/`);
    debugNSP(nsp);
    this.nsp = nsp;

    this.users = new UserManager(this);

    this.gameConfig = new Config(baseConfigData);

    this.syncManager = new RoomSyncManager(this);

    //Password Authentication
    nsp.use((socket: Socket, next: (err?: Error) => void) => {
      const { password } = socket.handshake.auth;

      if (this.password) {
        if (this.password !== password) {
          return next(new Error("Invalid Password"));
        }
      }

      next();
    });

    this.users.listen();
  }

  template(): RoomTemplate {
    const { name, code, host, password, userCount } = this;
    return {
      name,
      code,
      hostName: host ? host.name : "Unnamed",
      pCount: userCount,
      pMax: 999,
      password: password || ""
    };
  }

  get userCount() {
    return this.users.userCount;
  }

  // Host
  isHost(user: User): boolean {
    if (!this.host) return false;
    return this.host.userId === user.userId;
  }

  setHost(user: User) {
    this.host = user;
    this.syncManager.updateList();
  }

  destroy() {
    this.manager.destroyRoom(this);
  }

  findUser(userID: string) {
    return this.users.findUser(userID);
  }

  on(event: string | symbol, listener: (...args: any[]) => void) {
    this.events.on(event, listener);
  }
}

export default Room;
