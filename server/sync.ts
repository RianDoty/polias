import { Namespace, Socket as SocketType } from "socket.io";
import Base from "./base";
import { RoomTemplate } from "./room";
import SyncStore, { SyncManager } from "./sync-manager";
import { UserTemplate } from "./user";

export interface SyncServerEvents {
  sync_data: <T extends keyof ListSyncKeywords>(keyword: T, data: ListSyncKeywords[T]) => void
  sync_diff: <T extends keyof ListSyncKeywords>(keyword: T, diff: Partial<ListSyncKeywords[T]>) => void
}

export interface SyncClientEvents {
  sync_subscribe: (keyword: keyof ListSyncKeywords) => void
  sync_unsubscribe: (keyword: keyof ListSyncKeywords) => void
}

type ListOf<T> = {[key: string]: T}
export interface ListSyncKeywords {
  rooms: ListOf<RoomTemplate>
  room_users: ListOf<UserTemplate>
  room_state: ListOf<{key?: string}>
}

type Socket = SocketType<any, SyncServerEvents>;
type Server = Namespace<any, SyncServerEvents>

const clone = require("lodash.clonedeep");

class SyncHost<V extends object> extends Base {
  readonly io!: Server
  readonly keyword: keyof ListSyncKeywords;
  data: V;

  constructor(io: Server, keyword: keyof ListSyncKeywords, def: V, manager: SyncManager = SyncStore.getManager(io)) {
    super(io);

    this.keyword = keyword;
    this.data = def || {};
    
    //Add the syncHost to its SyncManager
    manager.addHost(this)
  }

  update(diff: Partial<V>) {
    const { data, io, keyword } = this;

    try {
      function patch<D extends object>(d: D, diff: Partial<D>) {
        for (const [key, value] of Object.entries(diff)) {
          function hasKey(tbl: {}): tbl is {[index: typeof key]: unknown} {
            return tbl.hasOwnProperty(key)
          }

          if (!hasKey(d) || typeof value !== typeof d[key]) {
            Object.assign(d, {key: value})
            continue;
          }
          
          if (value && typeof value === 'object') {
            const dk = d[key]
            if (dk && typeof dk === 'object') {
              patch(value, dk)
              continue;
            }
          }
          
          if (value === undefined) delete d[key]

          Object.assign(d, {key: value})
        }
      }
      
      patch(data, diff)
      io.to(keyword).emit(`sync_diff`, this.keyword,  diff);
    } catch {
      console.error(`Error in diff`);
    }
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
