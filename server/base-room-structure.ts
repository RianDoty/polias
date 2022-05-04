import Base from './base'
import Room from './room'

export default class BaseRoomStructure extends Base {
    room: Room

    constructor(room: Room) {
        super(room.ioNamespace)

        this.room = room
    }
}