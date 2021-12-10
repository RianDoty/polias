const {v4: uuidv4} = require('uuid');

class User {
  constructor(socket, {name='Unknown'}={}) {
    this.socket = socket;
    this.name = name;
    this.host = false;
    this.id = uuidv4();
  }
  
  setNickname(nickname) {
    if (nickname !== '') this.name = nickname;
  }
  
  template() {
    const {name, socket, host} = this;
    const socketId = socket.id;
    return {name, socketId, host}
  }
}

module.exports = User;