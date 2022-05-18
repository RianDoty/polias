import { Namespace, Socket as SocketType } from "socket.io";
import Base from "./base";
import SyncStore, { SyncManager } from "./sync-manager";

interface SyncServerEvents {
  sync_create: (keyword: string, key: string, value: unknown) => void
  sync_update: (keyword: string, value: unknown, ...keys: string[]) => void
  sync_delete: (keyword: string, key: string) => void
  sync_data: (keyword: string, data: { [key: string]: unknown }) => void
}

type Socket = SocketType<any, SyncServerEvents>;
type Server = Namespace<any, SyncServerEvents>

const clone = require("lodash.clonedeep");

class SyncHost<V> extends Base {
  io!: Server
  keyword: string;
  data: { [key: string]: V };
  sockets: Set<Socket>;
  subscribeSocket: Map<
    Socket,
    (ack: (arg0: { [key: string]: V }) => void) => void
  >;
  unsubscribeSocket: Map<Socket, () => void>;

  constructor(io: Server, keyword: string, def: { [key: string]: V } = {}, manager: SyncManager = SyncStore.getManager(io)) {
    super(io);

    this.keyword = keyword;
    this.data = def;
    this.sockets = new Set();

    this.subscribeSocket = new Map();
    this.unsubscribeSocket = new Map();
    
    //Add the syncHost to its SyncManager
    manager.addHost(this)
  }

  route(callback: (...args: any[]) => void): (keyword: string, ...args: any[]) => void {
    return (keyword: string, ...args: any[]) => {
      if (this.keyword === keyword) {
        callback(...args);
      }
    };
  }

  create(key: string, value: V) {
    const { data, io, keyword } = this;
    data[key] = clone(value);

    io.to(keyword).emit("sync_create", keyword, key, value);
  }

  update(...path: any[]) {
    const { data, io, keyword } = this;

    try {
      const value = path.pop();
      const prop = path.pop();
      const obj = path.reduce(
        (c: { [key: string]: { [key: string]: any } }, k: string) => c[k],
        data
      );

      obj[prop] = value;
      io.to(keyword).emit(`sync_update`, keyword, value, ...path);
    } catch {
      console.error(`Error in update sync with args ${path}`);
    }
  }

  delete(key: string) {
    const { data, io, keyword } = this;

    delete data[key];

    io.to(keyword).emit("sync_delete", keyword, key);
  }

  set(data: { [key: string]: V }) {
    const { io, keyword } = this;
    this.data = clone(data);
    io.to(keyword).emit(`sync_data`, keyword, data);
  }

  subscribe(socket: Socket) {
    //Return the current value to the client as the initial value
    socket.emit('sync_data', this.keyword, this.data)
    //The client is sent further changes
    socket.join(this.keyword);
  }

  unsubscribe(socket: Socket) {
    //Stop sending the client changes
    socket.leave(this.keyword);
  }
}

export default SyncHost;
