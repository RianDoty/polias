const { v4: uuidv4 } = require("uuid");
const EventEmitter = require("events");
const BaseRoomStructure = require("./base-room-structure");

const maxNicknameLength = 20;

//Represents a Socket inside of a Room
class User extends BaseRoomStructure {
  constructor(room, { userID, name = "Unknown" } = {}) {
    super(room);
    //Reflect changes to the client sockets
    this.on("changed", (diff) => this.sock.emit("changed", diff));

    Object.assign(this, {
      name,
      userID,
      host: false,
      ready: false,
      inGame: false,
      room: null,
      role: "Chillin'",
      cardId: -1
    })
    
    this.generateUuid();
  }
  
  getSockets() {
    return 
  }

  setNickname(nickname) {
    //Verification
    if (nickname.length > maxNicknameLength) return false;

    this.name = nickname;
    this.emit("changed", { name: nickname });
  }

  setReady(ready = !this.ready) {
    this.ready = ready;

    if (!this.inGame) {
      const role = ready ? "Ready" : "Chillin'";
      this.role = role;
      this.emit('changed', { role })
    }
    this.emit("changed", { ready });
  }
  
  setHost(isHost = false) {
    this.emit('changed', {host: isHost});
  }

  assignCard(cardId) {
    this.cardId = cardId;
    this.emit("changed", { cardId });
  }

  template() {
    const {
      name,
      socket: { id: socketId },
      host,
      cardId,
      id,
      ready,
      role
    } = this;
    return { name, socketId, host, cardId, id, ready, role };
  }

  isHost() {
    return this.room.isHost(this.socket);
  }

  generateUuid() {
    this.id = uuidv4();
    this.emit("changed", { id: this.id });
  }

  hasAdmin() {
    //Determines if a user has perms to change parts of the game
    return this.isHost();
  }
  
  static create(socket) {
    socket.user = new User(socket, {})
  }
}

module.exports = User;
