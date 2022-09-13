import Base from "./base";
import Room from "./room";
import { SyncHost } from "./sync";
import { unregisterCode } from "./random-code";
import type { RoomData } from "./room";
import { Namespace } from "socket.io";

class RoomManager extends Base {
  rooms: Map<string, Room>;
  roomListSync: SyncHost<"rooms">;

  constructor(io: Namespace) {
    super(io);

    this.rooms = new Map();

    this.roomListSync = new SyncHost(io, "rooms", {});
  }

  createRoom(roomData: RoomData) {
    const { code: roomCode } = roomData;
    if (!roomData.code) throw Error("Room cannot be created without a code!");

    const newRoom = new Room(this, roomData);
    this.rooms.set(roomCode, newRoom);
    this.roomListSync.update({ [roomCode]: newRoom.template() });

    return newRoom;
  }

  destroyRoom(room: Room) {
    const { code } = room;
    this.rooms.delete(code);
    this.roomListSync.update({ [code]: undefined });
    unregisterCode(code);
  }

  roomExists(code: string) {
    return this.rooms.has(code);
  }

  findRoom(code: string) {
    return this.rooms.get(code);
  }
}

export default RoomManager;
