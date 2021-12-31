const {v4: uuidv4} = require('uuid');

class User {
  constructor(socket, {name='Unknown'}={}) {
    this.socket = socket;
    this.name = name;
    this.host = false;
    this.room = null;
    this.cardId = -1;
    this.id = uuidv4();

    socket.emit('assign-uuid', this.id)
  }
  
  setNickname(nickname) {
    if (nickname !== '') this.name = nickname;
  }
  
  assignCard(cardId) {
    this.cardId = cardId
    this.socket.emit('assign-card', cardId)
    setTimeout(()=>{
      this.room.usersSync.update(this.id, 'cardId', cardId)
      console.log(`cardId in '${this.room.usersSync.keyword}' for id ${this.id.substring(0,5)}.. updated to ${cardId}`)
    },2000)
    
  }
  
  template() {
    const { name, socket, host, cardId, id } = this;
    const socketId = socket.id;
    return { name, socketId, host, cardId, id }
  }
  
  hasAdmin() {
    //Determines if a user has perms to change parts of the game
    return this.host;
  }
}

module.exports = User;