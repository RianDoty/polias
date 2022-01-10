

class Game {
    constructor(room, config) {
        this.io = room.io;
        this.room = room;
        this.config = config;
    }

    start() {

    }

    end(winner) {
        this.announceWinner(winner);
    }

    announceWinner(user) {
        this.io.to(this.room.code).emit('winner', user.template())
    }
}

module.exports = Game;