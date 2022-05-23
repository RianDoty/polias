import { Namespace } from "socket.io";
import Base from "./base";
import SyncStore from "./sync-manager";

interface BaseClientEvents {
    sync_subscribe: (keyword: string) => void
}

type BaseSyncServer = Namespace<BaseClientEvents, any>

export class BaseSyncHost extends Base {
    constructor(io: BaseSyncServer, keyword: string, def: unknown, manager = SyncStore.getManager(io)) {
        super(io)

        manager.addHost(this)
    }
}