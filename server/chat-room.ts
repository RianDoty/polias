
import Base from "./base";
import type ChatRoomManager from "./chat-manager";
import type { RoomSocket } from "./room-socket-types";
import SyncHost from "./sync";
import type { UserTemplate } from "./user";

export interface ChatMessage {
  author: UserTemplate
  content: string
}

type CallbacksList = [string, (...args: any[]) => void][]

class ChatRoom extends Base {
  sync!: SyncHost<ChatMessage>
  sockets!: Set<RoomSocket>
  callbacks!: Map<RoomSocket, CallbacksList>
  keyword!: string

  constructor(manager: ChatRoomManager, chatKeyword: string) {
    super(manager.io)
    const keyword = `room chat ${chatKeyword}`;

    Object.assign(this, {
      keyword,
      sync: new SyncHost(this.io, keyword),
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