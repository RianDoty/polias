import type { Socket } from "socket.io";
import type{ RoomData, RoomParameters } from "./room";
import type { Namespace } from 'socket.io';
import type { SyncManager } from "./sync-manager";
import { ChatRoomEvents } from "./chat-room";
import { Session } from "./session-types";

export interface ServerToClientEvents {
  session: (Session) => void

  room_send: (code: string) => void;
  sync_create: (keyword: string, key: string, value: unknown) => void
  sync_update: (keyword: string, value: unknown, ...keys: string[]) => void
  sync_delete: (keyword: string, key: string) => void
  sync_data: (keyword: string, data: {[key: string]: unknown}) => void
  room_chat: () => void
}
export interface ClientToServerEvents {
  username: (username: string) => void;
  room_create: (roomData: RoomParameters) => void;
  log: (...args: any[]) => void;
  sync_subscribe: (keyword: string, ack: (data: {[key:string]: unknown}) => void) => void
  sync_unsubscribe: (keyword: string) => void
}
interface InterServerEvents {

}
interface SocketData {
  userID: string;
  username: string;
}


export type Server = Namespace<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
export type Socket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;