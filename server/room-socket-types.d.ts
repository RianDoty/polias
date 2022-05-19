import { Namespace, Socket } from 'socket.io'
import { ChatRoomEvents } from './chat-room'
import { SyncClientEvents, SyncServerEvents } from './sync'
import User from './user'

interface ServerToClientEvents {
    sync_create: (keyword: string, key: string, value: unknown) => void
    sync_update: (keyword: string, value: unknown, ...keys: string[]) => void
    sync_delete: (keyword: string, key: string) => void
    sync_set: (keyword: string, data: { [key: string]: unknown }) => void
    session: ({sessionID: string, userID: string}) => void
    room_chat: () => void
}
interface ClientToServerEvents {
    send_message: (content: string) => void
    sync_subscribe: (keyword: string) => void
    sync_unsubscribe: (keyword: string) => void
}
interface InterServerEvents {

}
interface SocketData {
    user: User
    sessionID: string
}

export type RoomServer = Namespace<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
export type RoomSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
