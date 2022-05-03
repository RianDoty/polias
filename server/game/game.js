const EventEmitter = require("events");

function addMiddleware(emitter, cb) {
  const oldEmit = emitter.emit;

  emitter.emit = function (...args) {
    cb(args);
    oldEmit.apply(emitter, args);
  };
}

class Game extends EventEmitter {
  constructor(room, config) {
    super();
    addMiddleware(this, (...args) => {
      //Reflect all game events to the client
      args[0] = `game-${args[0]}` //e.g. 'start' => 'game-start'
      this.ioRoom.emit(...args)
    })

    this.room = room;
    this.io = room.io;
    this.ioRoom = room.ioRoom;
    this.config = config;
  }

  start() {
    this.emit("start");
    setTimeout(() => {
      this.end();
    }, 10000); // TEST: end in 10 seconds
  }

  end(winner = "cancelled") {
    this.announceWinner(winner);
    this.emit("end", { winner });
  }

  announceWinner(user) {
    if ((user = "cancelled")) return this.ioRoom.emit("game-cancelled");
    this.ioRoom.emit("winner", user.template());
  }
}

module.exports = Game;
