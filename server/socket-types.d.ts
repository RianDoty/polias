import type { Socket } from "socket.io";
import type{ RoomData } from "./room";
import type { Server } from 'socket.io';
import type { SyncManager } from "./sync-manager";
import { ChatRoomEvents } from "./chat-room";

interface ServerToClientEvents {
  room_send: (code: string) => void;
  sync_create: (keyword: string, key: string, value: unknown) => void
  sync_update: (keyword: string) => void
  sync_delete: (keyword: string, key: string) => void
  sync_set: (keyword: string, data: {[key: string]: unknown}) => void
  room_chat: () => void
}
interface ClientToServerEvents {
  username: (username: string) => void;
  room_create: (roomData: RoomData) => void;
  log: (...args: any[]) => void;
  sync_subscribe: (keyword: string) => void
  sync_unsubscribe: (keyword: string) => void
}
interface InterServerEvents {

}
interface SocketData {
  username: string;
  userID: string
}


export type Server = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
export type Socket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;