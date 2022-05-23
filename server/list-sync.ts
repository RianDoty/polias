import { Namespace, Socket as SocketType } from "socket.io";
import Base from "./base";
import { RoomTemplate } from "./room";
import SyncStore, { SyncManager } from "./sync-manager";
import { UserTemplate } from "./user";

interface ListSyncServerEvents {
  sync_create: (keyword: string, key: string, value: unknown) => void
  sync_update: (keyword: string, value: unknown, ...keys: string[]) => void
  sync_delete: (keyword: string, key: string) => void
  sync_data: (keyword: string, data: { [key: string]: unknown }) => void
}

export interface ListSyncKeywords {
  rooms: RoomTemplate
  room_users: UserTemplate
  room_state: any
}

type Socket = SocketType<any, ListSyncServerEvents>;
type Server = Namespace<any, ListSyncServerEvents>

const clone = require("lodash.clonedeep");

class SyncHost<V extends object> extends Base {
  readonly io!: Server
  readonly keyword: keyof ListSyncKeywords;
  data: V;

  constructor(io: Server, keyword: keyof ListSyncKeywords, def: V = {}, manager: SyncManager = SyncStore.getManager(io)) {
    super(io);

    this.keyword = keyword;
    this.data = def;
    
    //Add the syncHost to its SyncManager
    manager.addHost(this)
  }

  update(diff) {
    const { data, io, keyword } = this;

    try {
      function patch(d, diff) {
        for (const [key, value] of Object.entries(diff)) {
          if (!diff.hasOwnProperty(key) || typeof value !== typeof diff[key]) {
            d[key] = value;
            continue;
          }
          
          if (typeof value === 'object') {
            patch(value, d[key])
            continue;
          }
          
          d[key] = value
        }
      }
      
      patch(data, diff)
      io.to(keyword).emit(`sync_diff`, diff);
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

export default ListSyncHost;
