import Base from "./base";
import type { RoomServer, RoomSocket } from "./room-socket-types";
import type { Server, Socket } from "./socket-types";
import SyncHost from "./sync";

export class SyncManagerStore {
    servers: Map<Server | RoomServer, Map<string, SyncHost<unknown>>>

    constructor() {
        this.servers = new Map();
    }

    getHosts(io: Server | RoomServer) {
        let syncHosts = this.servers.get(io);
        if (!syncHosts) {
            syncHosts = new Map<string, SyncHost<unknown>>();
            this.servers.set(io, syncHosts)
        }

        return syncHosts
    }

    getHost(io: Server | RoomServer, keyword: string) {
        const hosts = this.getHosts(io);
        return hosts.get(keyword)
    }

   

class SyncManager {


    addHost(host: SyncHost<unknown>) {
        const { io, keyword } = host;

        const syncHosts = this.getHosts(io)

        if (syncHosts.has(keyword)) throw `Duplicate SyncHost created: ${keyword}`

        syncHosts.set(keyword, host)
    }

    subscribeSocket(socket: Socket, keyword: string, ack: (arg0: unknown) => void) {
        const host = this.getHost(socket.io);
        if (!host) throw `Attempt to subscribe to non-existent host: ${keyword}`

        host.subscribe(socket, ack)
    }
}
}

export default new SyncManagerStore();