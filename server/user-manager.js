//Manages the creation, updating, etc. of sessions and users
const SessionStore = require('./session-store')
const User = require('./user');
const uuid = require('uuid');
const BaseManager = require('./base-manager');

module.exports = class UserManager extends BaseManager {
    constructor(room) {
        super(room)
    }

    onConnection(socket) {
        
    }
}