const { v4: uuidv4 } = require("uuid");
const EventEmitter = require("events");

const maxNicknameLength = 20;
class User extends EventEmitter {
  constructor(socket, { name = "Unknown" } = {}) {
    super();
    this.on("changed", (diff) => this.socket.emit("changed", diff));

    this.socket = socket;
    this.name = name;
    this.host = false;
    this.ready = false;
    this.inGame = false;
    this.room = null;
    this.role = "Chillin'";
    this.cardId = -1;
    this.generateUuid();
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

  assignCard(cardId) {
    this.cardId = cardId;
    this.socket.emit("assign-card", cardId);
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
    } = this;
    return { name, socketId, host, cardId, id, ready };
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
}

module.exports = User;
