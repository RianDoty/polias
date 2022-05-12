import Base from "./base";
import type { Server } from 'socket.io'
import type SyncHost from "./sync";

interface SyncClientEvents {
  sync_subscribe: (keyword: string) => void;
  sync_unsubscribe: (keyword: string) => void
}

export class SyncManagerStore {
  managers: Map<Server, SyncManager>;

  constructor() {
    this.managers = new Map();
  }

  getManager(io: Server) {
    let syncHosts = this.servers.get(io);
    if (!syncHosts) {
      syncHosts = new Map<string, SyncHost<unknown>>();
      this.managers.set(io, syncHosts);
    }

    return syncHosts;
  }

  getHost(io: Server, keyword: string) {
    const hosts = this.getManager(io);
    return hosts.get(keyword);
  }
}

class SyncManager {
  hosts: Map<string, SyncHost>
  
  constructor() {
    this.hosts = new Map()
  }
  
  getHost(keyword) {
    return this.hosts.get(keyword)
  }
  
  addHost(host: SyncHost<unknown>) {
    const { io, keyword } = host;

    if (this.hosts.has(keyword)) throw `Duplicate SyncHost created: ${keyword}`;

    this.hosts.set(keyword, host);
  }

  subscribeSocket(socket: Socket, keyword: string, ack: (arg0: unknown) => void) {
    const host = this.getHost(keyword)
  }
}

export default new SyncManagerStore();
