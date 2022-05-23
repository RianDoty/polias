import { Namespace } from "socket.io";
import Base from "./base";
import SyncStore from "./sync-manager";

interface BaseClientEvents {
  sync_subscribe: (keyword: string) => void;
  sync_unsubscribe: (keyword: string) => void;
}

type BaseSyncServer = Namespace<BaseClientEvents, any>;

export default class BaseSyncHost extends Base {
  io!: BaseSyncServer;
  keyword: string;
  data: unknown;

  constructor(
    io: BaseSyncServer,
    keyword: string,
    def: unknown,
    manager = SyncStore.getManager(io)
  ) {
    super(io);

    this.data = def;
    this.keyword = keyword;

    manager.addHost(this);
  }
}
