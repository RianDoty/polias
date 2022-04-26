const Base = require("./base");

module.exports = class BaseRoomStructure extends Base {
    constructor(room) {
        super(room.ioNamespace)

        Object.defineProperty(this, 'room', { value: room })
    }
}