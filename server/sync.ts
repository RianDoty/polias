import { nextTick } from "process";
import { Namespace, Socket } from "socket.io";
import Base from "./base";
import Room, { RoomTemplate } from "./room";
import User, { UserTemplate } from "./user";

//Clones using JSON to avoid tricky things that
//WebSockets wouldn't be able to transfer anyways.
const JSONClone = (tbl: object) => JSON.parse(JSON.stringify(tbl));

export interface SyncServerEvents<k extends keyof SyncKeywords> {
  sync_data: (data: SyncKeywords[k]) => void;
  sync_diff: (diff: Diff<SyncKeywords[k]>) => void;
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

    nsp.on("connect", (socket) => this.sendData(socket));

    console.log(`initiating sync ${io.name}sync/${keyword}/`);
  }

  sendData(socket: Socket, data?: SyncKeywords[V]) {
    socket.emit("sync_data", data ?? this.data);
  }

  update(diff: Diff<SyncKeywords[V]>) {
    const { data, nsp } = this;

    try {
      patch(data, diff);
      nsp.emit(`sync_diff`, diff);
    } catch (err) {
      console.error(`Error in diff`);
      console.error(err);
    }
  }
}

// Like a SyncHost, but different for each user.
// Use update() if you dare
class PersonalSyncHost<V extends keyof SyncKeywords> extends SyncHost<V> {
  readonly individualData: Map<string, SyncKeywords[V]>;
  constructor(room: Room, keyword: V, def: SyncKeywords[V]) {
    super(room.io, keyword, def);

    this.io.use((socket, next) => {
      const sessionId: string | undefined = socket.handshake.auth.sessionId;
      if (typeof sessionId !== "string")
        return next(Error("Socket must have a valid session ID!"));

      const user = room.users.findUser(sessionId);
      if (!user)
        return next(Error("Provided session ID does not exist on server!"));

      socket.data.userId = user.userId;
    });

    this.individualData = new Map();
  }

  sendData(socket: Socket, data?: SyncKeywords[V]) {
    if (data) return super.sendData(socket, data);

    const userId = socket.data.userId;

    if (!this.individualData.has(userId))
      this.individualData.set(userId, JSONClone(this.data));
    super.sendData(socket, this.individualData.get(userId));
  }

  updateUser(user: User, diff: Diff<SyncKeywords[V]>) {
    const data = this.individualData.get(user.userId) ?? {};

    try {
      patch(data, diff);
      this.io.to(user.userId).emit("sync_diff", diff);
    } catch (err) {
      console.error("error in diff");
      console.error(err);
    }
  }
}

export { SyncHost, PersonalSyncHost };
