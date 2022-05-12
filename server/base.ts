import type { RoomServer } from "./room-socket-types";
import type { Server } from "./socket-types";


export default class Base {
    readonly io!: Server | RoomServer

    constructor(io: Server | RoomServer) {
        Object.defineProperty(this, 'io', { value: io })
    }
}