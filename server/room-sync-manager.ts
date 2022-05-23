import BaseManager from "./base-manager"
import ListSyncHost from "./list-sync"

import type Room from "./room"
import type { RoomTemplate } from "./room"
import type { UserTemplate } from "./user"
import type User from "./user"
import SyncManagerStore, { SyncManager } from "./sync-manager"
import { RoomSocket } from "./room-socket-types"

export default class RoomSyncManager extends BaseManager {
    usersSync!: ListSyncHost<UserTemplate>
    stateSync!: ListSyncHost<any>
    listSync!: ListSyncHost<RoomTemplate>
    syncManager: SyncManager

    constructor(room: Room) {
        super(room)

        const { io, code } = this;

        Object.assign(this, {
            usersSync: new ListSyncHost(io, 'room_users', {}),
            stateSync: new ListSyncHost(io, 'room_state', {
                state: 'lobby',
                cardPack: 'fruits'
            }),
            listSync: room.manager.syncHost
        })

        //SyncManager
        this.syncManager = SyncManagerStore.getManager(io)
    }

    onConnect(socket: RoomSocket) {
        socket.on('sync_subscribe', keyword => {
            this.syncManager.subscribeSocket(socket, keyword)
        })

        socket.on('sync_unsubscribe', keyword => {
            this.syncManager.unsubscribeSocket(socket, keyword)
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