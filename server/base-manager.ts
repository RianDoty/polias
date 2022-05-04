import BaseRoomStructure from "./base-room-structure";
import Room from "./room";

export default class BaseManager extends BaseRoomStructure {
    constructor(room: Room) {
        super(room);
    }
}