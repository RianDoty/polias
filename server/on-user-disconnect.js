const { saveSession } = require('./sessions')

function onDisconnect(io, socket) {
  saveSession(socket)
}

module.exports = (io, socket) => {
  socket.on('disconnect', async () => {
    //If all of the sockets controlling that same user have been disconnected..
    const sameUserSockets = await io.in(socket.userID).allSockets();
    const userHasDisconnected = sameUserSockets.size === 0;
    if (userHasDisconnected) {
      onDisconnect(io, socket)
    }
  })
}