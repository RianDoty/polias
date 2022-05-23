
import Base from "./base";
import type ChatRoomManager from "./chat-manager";
import type { RoomSocket } from "./room-socket-types";
import ListSyncHost from "./list-sync";
import type { UserTemplate } from "./user";

export interface ChatMessage {
  author: UserTemplate
  content: string
}

type CallbacksList = [string, (...args: any[]) => void][]

export type ChatKeyword = 'lobby'
export type ChatInternalKeyword = `room_chat_${ChatKeyword}`

export type ChatRoomKeywords = {[key in ChatInternalKeyword]: ChatMessage}

class ChatRoom extends Base {
  sync!: ListSyncHost<ChatMessage>
  sockets!: Set<RoomSocket>
  callbacks!: Map<RoomSocket, CallbacksList>
  keyword!: ChatInternalKeyword

  constructor(manager: ChatRoomManager, chatKeyword: ChatKeyword) {
    super(manager.io)
    const keyword: ChatInternalKeyword = `room_chat_${chatKeyword}`;

    Object.assign(this, {
      keyword,
      sync: new ListSyncHost(this.io, keyword),
      sockets: new Set(),
      callbacks: new Map()
    })
  }
  
  join(socket: RoomSocket) {
    socket.join(this.keyword);
    this.sockets.add(socket);
    this.connect(socket)
  }
  
  leave(socket: RoomSocket) {
    socket.leave(this.keyword);
    this.sockets.delete(socket);
    this.disconnect(socket);
  }
  
  connect(socket: RoomSocket) {
     
  }
  
  disconnect(socket: RoomSocket) {
    
  }
}

export default ChatRoom;