import Base from './base'
import Room from './room'

export default class BaseRoomStructure extends Base {
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