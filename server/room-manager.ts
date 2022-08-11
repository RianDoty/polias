import Base from "./base";
import Room from "./room";
import type { RoomData, RoomTemplate } from './room'
import SyncHost from "./sync";
import { randomCode, unregisterCode } from "./random-code";
import type { Server } from "./socket-types";

const noop = () => {};

class RoomManager extends Base {
  rooms: Map<string, Room>
  syncHost: SyncHost<'rooms'>

  constructor(io: Server) {
    super(io)

    this.rooms = new Map();
    
    this.syncHost = new SyncHost(io, "rooms", {});
  }

  createRoom(roomData: RoomData) {
    const { code } = roomData;
    if (!roomData.code) throw 'Room cannot be created without a code!'
    
    const newRoom = new Room(this, roomData);
    this.rooms.set(code, newRoom)
    this.syncHost.update({[code]: newRoom.template()})
    
    return newRoom
  }

  destroyRoom(room: Room) {
    const { code } = room;
    this.rooms.delete(code);
    this.syncHost.update({[code]: undefined});
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