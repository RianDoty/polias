//Represents a structure that communicates through an io manager

module.exports = class Base {
    constructor(io) {
        Object.defineProperty(this, 'io', { value: io })
    }
}