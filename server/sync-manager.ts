 import Base from "./base";
import type { Namespace, Socket as SocketType } from 'socket.io'
import type BaseSyncHost from "./base-sync";

interface SyncClientEvents {
  sync_subscribe: (keyword: string) => void;
  sync_unsubscribe: (keyword: string) => void
}

type Server = Namespace<SyncClientEvents, any>
type Socket = SocketType<SyncClientEvents, any>

export class SyncManagerStore {
  managers: Map<Server, BaseSyncManager>;

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
  hosts: Map<string, BaseSyncHost>
  
  constructor() {
    this.hosts = new Map()
  }
  
  getHost(keyword: string) {
    return this.hosts.get(keyword)
  }
  
  addHost(host: BaseSyncHost) {
    const { io, keyword } = host;

    if (this.hosts.has(keyword)) throw `Duplicate SyncHost created: ${keyword}`;

    this.hosts.set(keyword, host);
  }

  subscribeSocket(socket: Socket, keyword: string) {
    const host = this.getHost(keyword)
    if (!host) throw `Attempt to subscribe to nonexistent host: ${keyword}`

    host.subscribe(socket)
  }

  unsubscribeSocket(socket: Socket, keyword: string) {
    const host = this.getHost(keyword)
    if (!host) return console.warn(`Attempt to unsubscribe to non-existent host: ${keyword}`);
    
    host.unsubscribe(socket)
  }
}

export default new SyncManagerStore();
