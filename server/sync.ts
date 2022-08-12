import { Namespace } from "socket.io";
import Base from "./base";
import { RoomTemplate } from "./room";
import { UserTemplate } from "./user";

export interface SyncServerEvents<k extends keyof SyncKeywords> {
  sync_data: (data: SyncKeywords[k]) => void;
  sync_diff: (diff: SyncKeywords[k]) => void;
}

//TODO: Fix this, this is not what it should be
type MessageTemplate = {};

type ListOf<T> = { [key: string]: T };
export interface SyncKeywords {
  rooms: ListOf<RoomTemplate>;
  room_users: ListOf<UserTemplate>;
  room_state: {
    state: "lobby" | "game";
  };
  room_options: {
    cardPack: "fruits";
  };
  chat_log: ListOf<MessageTemplate>;
}

type Server<k extends keyof SyncKeywords> = Namespace<any, SyncServerEvents<k>>;

function hasKey<K extends string>(
  tbl: {},
  key: K
): tbl is { [index in K]: unknown } {
  return tbl.hasOwnProperty(key);
}

export type Diff<T> = { [K in keyof T]?: Diff<T[K]> };
function patch<D extends object>(d: D, diff: Diff<D>) {
  for (const [key, value] of Object.entries(diff)) {
    if (!hasKey(d, key) || typeof value !== typeof d[key]) {
      Object.assign(d, { key: value });
      continue;
    }

    if (value && typeof value === "object") {
      const dk = d[key];
      if (dk && typeof dk === "object") {
        patch(value, dk);
        continue;
      }
    }

    if (value === undefined) delete d[key];

    Object.assign(d, { key: value });
  }
}

class SyncHost<V extends keyof SyncKeywords> extends Base {
  readonly io!: Server<V>;
  readonly nsp: Namespace;
  readonly keyword: V;
  data: SyncKeywords[V];

  constructor(io: Namespace, keyword: V, def: SyncKeywords[V]) {
    super(io);

    this.keyword = keyword;
    this.data = def;

    const nsp = io.server.of(`${io.name}sync/${keyword}/`);
    this.nsp = nsp;

    nsp.on("connect", (socket) => {
      socket.emit("sync_data", this.data);
    });

    console.log(`initiating sync ${io.name}sync/${keyword}/`);
  }

  update(diff: Diff<SyncKeywords[V]>) {
    const { data, nsp } = this;

    try {
      patch(data, diff);
      nsp.emit(`sync_diff`, diff);
    } catch {
      console.error(`Error in diff`);
    }
  }
}

export default SyncHost;
