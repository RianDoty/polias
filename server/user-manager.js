//Manages the creation, updating, etc. of user profiles
//Users are stored in the sockets
//also here ig
const User = require('./user');

module.exports = (io) => {
  io.on('connection', (socket) => {
    const user = new User(socket)
    socket.user = user;
    
    socket.on('set nickname', nickname => user.setNickname(nickname));
    socket.on('toggle-ready', ready => user.setReady(ready));
  })
}