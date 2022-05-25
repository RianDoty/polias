import Base from "./base";
import Room from "./room";
import type { RoomData, RoomTemplate } from './room'
import ListSyncHost from "./sync";
import { randomCode, unregisterCode } from "./random-code";
import type { Server } from "./socket-types";

const noop = () => {};

class RoomManager extends Base {
  rooms: Map<string, Room>
  syncHost: ListSyncHost<RoomTemplate>

  constructor(io: Server) {
    super(io)

    this.rooms = new Map();
    
    this.syncHost = new ListSyncHost(io, "rooms");
  }

  createRoom(roomData: RoomData) {
    const { code } = roomData;
    if (!roomData.code) throw 'Room cannot be created without a code!'
    
    const newRoom = new Room(this, roomData);
    this.rooms.set(code, newRoom)
    
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

export default RoomManager