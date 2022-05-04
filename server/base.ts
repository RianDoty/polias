//Represents a structure that communicates through an io manager
import { Namespace, Server } from "socket.io"

export default class Base {
    readonly io: Server | Namespace

    constructor(io: Server | Namespace) {
        this.io = io;
    }
}