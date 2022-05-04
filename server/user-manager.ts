//Manages the creation, updating, etc. of sessions and users
import User from './user';
import BaseManager from './base-manager';
import { v4 as uuid } from 'uuid'
import type Room from './room';
import type { Socket } from 'socket.io';

export default class UserManager extends BaseManager {
    users: Map<string, User>

    constructor(room: Room) {
        super(room)

        this.users = new Map()
    }

    findUser(userID: string): User | undefined {
        return this.users.get(userID)
    }

    onConnection(socket: Socket) {
        
    }

    get userCount(): number {
        return this.users.size
    }
}