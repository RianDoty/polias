import type { Socket } from "socket.io";
import type{ RoomData, RoomParameters } from "./room";
import type { Namespace } from 'socket.io';
import type { SyncManager } from "./sync-manager";
import { ChatRoomEvents } from "./chat-room";
import { Session } from "./session-types";
import { SyncClientEvents, SyncServerEvents } from "./sync";

interface ServerToClientEventsBase {
  session: (Session) => void
  room_send: (code: string) => void;
  room_chat: () => void
}
export type ServerToClientEvents = ServerToClientEventsBase & SyncServerEvents


interface ClientToServerEventsBase {
  username: (username: string) => void;
  room_create: (roomData: RoomParameters) => void;
  log: (...args: any[]) => void;
}

export type ClientToServerEvents = ClientToServerEventsBase & SyncClientEvents

interface InterServerEvents {

}
interface SocketData {
  userID: string;
  username: string;
}


export type Server = Namespace<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
export type Socket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;