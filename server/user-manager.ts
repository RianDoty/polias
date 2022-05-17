//Manages the creation, updating, etc. of sessions and users
import User from './user';
import BaseManager from './base-manager';
import { v4 as uuid } from 'uuid'
import type Room from './room';
import type { RoomSocket } from './room-socket-types';

export default class UserManager extends BaseManager {
    users: Map<string, User>

    constructor(room: Room) {
        super(room)

        this.users = new Map()

        this.io.use((socket, next) => {
            const { sessionID } = socket.handshake.auth

            if (sessionID) {
                //Look up an existing user, if not, throw an error
                const existingUser = this.users.get(sessionID);
                if (!existingUser) next(new Error('Invalid SessionID'))
                socket.data.user = existingUser
                return next()
            }

            //Make a new user
            const { username } = socket.handshake.auth;
            const newUser = new User(this.room, { name: username })

            socket.data.user = newUser
            next()
        })
    }

    findUser(userID: string) {
        return this.users.get(userID)
    }

    onConnection(socket: RoomSocket) {
        socket.emit('session', socket.handshake.auth.sessionID || uuid())
    }

    get userCount(): number {
        return this.users.size
    }
}