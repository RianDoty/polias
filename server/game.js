const EventEmitter = require('events')

class Game extends EventEmitter {
  constructor(room, config) {
    super()
    
    this.room = room;
    this.io = room.io;
    this.ioRoom = room.ioRoom;
    this.config = config;
  }

  start() {
    this.emit('start');
    setTimeout(()=>{this.end()},10000) // TEST: end in 10 seconds
  }

  end(winner='cancelled') {
    this.announceWinner(winner);
    this.emit('end', {winner});
  }

  announceWinner(user) {
    if (user='cancelled') return this.ioRoom.emit('game-cancelled');
    this.ioRoom.emit("winner", user.template());
  }
}

module.exports = Game;
