//Manages the creation, updating, etc. of user profiles
//Users are stored in the sockets
//also here ig
const User = require('./user');

module.exports = (io) => {
  io.on('connection', (socket) => {
    socket.user = new User(socket)
    
    socket.on('set nickname', nickname => socket.user.setNickname(nickname));
  })
}