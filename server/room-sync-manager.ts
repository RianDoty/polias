import BaseManager from "./base-manager"
import SyncHost from "./sync"

import type Room from "./room"
import type { RoomTemplate } from "./room"
import type { UserTemplate } from "./user"
import type User from "./user"

export default class RoomSyncManager extends BaseManager {
    usersSync!: SyncHost<UserTemplate>
    stateSync!: SyncHost<any>
    listSync!: SyncHost<RoomTemplate>

    constructor(room: Room) {
        super(room)

        const { io, code } = this;

        Object.assign(this, {
            usersSync: new SyncHost(io, `room users ${code}`, {}),
            stateSync: new SyncHost(io, `room state ${code}`, {
                state: 'lobby',
                cardPack: 'fruits'
            }),
            listSync: room.manager.syncHost
        })
    }

    addUser(user: User) {
        this.usersSync.create(user.userID, user.template())
    }

    deleteUser(user: User) {
        this.usersSync.delete(user.userID)
    }

    updateUser(user: User, ...pathThenValue: any[]) {
        this.usersSync.update(user.userID, pathThenValue)
    }

    updateState(key: string, value: any) {
        this.stateSync.update(key, value)
    }

    updateList() {
        this.listSync.update(this.code, this.room.template())
    }
}