//Manages the creation, updating, etc. of sessions and users
import SessionStore from './session-store';
import User from './user';
import BaseManager from './base-manager';
import { v4 as uuid } from 'uuid'
import type Room from './room';
import type { Socket } from 'socket.io';

export default class UserManager extends BaseManager {
    constructor(room: Room) {
        super(room)
    }

    onConnection(socket: Socket) {
        
    }
}