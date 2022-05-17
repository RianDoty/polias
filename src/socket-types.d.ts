import { Socket } from "socket.io-client";
import { ServerToClientEvents as ServerToClientBase, ClientToServerEvents as ClientToServerBase } from '../server/socket-types'
import { ServerToClientEvents as ServerToClientRoom, ClientToServerEvents as ClientToServerRoom } from '../server/room-socket-types'

export type BaseSocket = Socket<ServerToClientBase, ClientToServerBase>
export type RoomSocket = Socket<ServerToClientRoom, ClientToServerRoom>