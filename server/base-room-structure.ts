import { Namespace } from "socket.io";
import Base from "./base";
import type Room from "./room";

export default class BaseRoomStructure extends Base {
  readonly io!: Namespace;
  readonly room!: Room;
  readonly code!: string;

  constructor(room: Room) {
    super(room.nsp);

    Object.defineProperties(this, {
      room: { value: room },
      code: { value: room.code }
    });
  }
}
