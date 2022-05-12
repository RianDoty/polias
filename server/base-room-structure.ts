import Base from './base'
import type Room from './room'
import { RoomServer } from './room-socket-types'

export default class BaseRoomStructure extends Base {
    readonly io!: RoomServer
    readonly room!: Room
    readonly code!: string

    constructor(room: Room) {
        super(room.ioNamespace)

        Object.defineProperties(this, {
            room: { value: room },
            code: { value: room.code }
        })
    }
}