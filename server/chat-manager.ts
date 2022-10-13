import BaseManager from './base-manager'
import Room from './room'

/** Manages the broadcasting of chat messages. */
export default class ChatManager extends BaseManager {
    constructor(room: Room) {
        super(room)


    }
}