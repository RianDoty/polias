import Base from "./base";
import Room, { RoomData } from "./room";
import SyncHost from "./sync";
import { randomCode, unregisterCode } from "./random-code";
import { Server } from "socket.io";

const noop = () => {};

class RoomManager extends Base {
  rooms: Map<string, Room>
  syncHost: SyncHost

  constructor(io: Server) {
    super(io)

    this.rooms = new Map();
    
    this.syncHost = new SyncHost(io, "rooms");
  }

  createRoom(roomData: RoomData) {
    const { code } = roomData;
    const { syncHost } = this;
    
    const newRoom = new Room(this, roomData);
    this.rooms.set(code, newRoom)
    syncHost.create(code, newRoom.template());
    
    return newRoom
  }

  destroyRoom(room: Room) {
    const { code } = room;
    this.rooms.delete(code);
    this.syncHost.delete(code);
    unregisterCode(code)
  }

  roomExists(code: string) {
    return this.rooms.has(code);
  }

  findRoom(code: string) {
    return this.rooms.get(code);
  }
}

export default (io: Server) => new RoomManager(io);
export type { RoomManager }