module.exports = class RoomSyncManager {
    constructor(room) {
        Object.assign(this, {
            room,
            usersSync: new SyncHost(ioNamespace, `room users ${code}`, {}),
            stateSync: new SyncHost(ioNamespace, `room state ${code}`, {
                state: 'lobby',
                cardPack: 'fruits'
            }),
            listSync: room.manager.syncHost
        })
    }

    addUser(user) {
        this.usersSync.create(user.userID, user.template())
    }

    deleteUser(user) {
        this.usersSync.delete(user.userID)
    }

    updateUser(...pathThenValue) {
        this.usersSync.update(user.userID, pathThenValue)
    }

    updateState(key, value) {
        this.stateSync.update(key, value)
    }

    updateList(key, value) {
        this.listSync.update(key, value)
    }
}