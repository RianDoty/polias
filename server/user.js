const {v4: uuidv4} = require('uuid');
const EventEmitter = require('events')

class User extends EventEmitter {
  constructor(socket, {name='Unknown'}={}) {
    super();
    this.on('changed', diff => this.socket.emit('changed', diff));
    
    this.socket = socket;
    this.name = name;
    this.host = false;
    this.room = null;
    this.cardId = -1;
    this.generateUuid();
  }
  
  setNickname(nickname) {
    this.name = nickname;
    console.log(`emitting change: {name: ${nickname}}`)
    this.emit('changed', {name: nickname})
  }
  
  assignCard(cardId) {
    this.cardId = cardId
    this.socket.emit('assign-card', cardId)
    this.emit('changed', {cardId});
    console.log(`cardId in '${this.room.usersSync.keyword}' for id ${this.id.substring(0,5)}.. updated to ${cardId}`)
  }
  
  template() {
    const { name, socket, host, cardId, id } = this;
    const socketId = socket.id;
    return { name, socketId, host, cardId, id }
  }
  
  isHost() {
    return this.room.isHost(this.socket);
  }
  
  generateUuid() {
    this.id = uuidv4();
    this.emit('changed', {id: this.id})
  }
  
  hasAdmin() {
    //Determines if a user has perms to change parts of the game
    return this.isHost();
  }
}

module.exports = User;