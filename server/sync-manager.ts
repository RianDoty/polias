import Base from "./base";
import type { Namespace, Socket as SocketType } from 'socket.io'
import type SyncHost from "./sync";

interface SyncClientEvents {
  sync_subscribe: (keyword: string) => void;
  sync_unsubscribe: (keyword: string) => void
}

type Server = Namespace<SyncClientEvents, any>
type Socket = SocketType<SyncClientEvents, any>

export class SyncManagerStore {
  managers: Map<Server, SyncManager>;

  constructor() {
    this.managers = new Map();
  }

  getManager(io: Server) {
    let syncHosts = this.managers.get(io);
    if (!syncHosts) {
      syncHosts = new SyncManager();
      this.managers.set(io, syncHosts);
    }

    return syncHosts;
  }

  getHost(io: Server, keyword: string) {
    const hosts = this.getManager(io);
    return hosts.getHost(keyword);
  }
}

export class SyncManager {
  hosts: Map<string, SyncHost<unknown>>
  
  constructor() {
    this.hosts = new Map()
  }
  
  getHost(keyword: string) {
    return this.hosts.get(keyword)
  }
  
  addHost(host: SyncHost<unknown>) {
    const { io, keyword } = host;

    if (this.hosts.has(keyword)) throw `Duplicate SyncHost created: ${keyword}`;

    this.hosts.set(keyword, host);
  }

  subscribeSocket(socket: Socket, keyword: string, ack: (arg0: unknown) => void) {
    const host = this.getHost(keyword)
    if (!host) throw `Attempt to subscribe to nonexistent host: ${keyword}`

    host.subscribe(socket, ack)
  }
}

export default new SyncManagerStore();
