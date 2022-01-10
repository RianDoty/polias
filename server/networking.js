const InitUsers = require('./user-manager')
const RoomsManager = require('./rooms-manager')

module.exports = (io)=>{
  const roomsManager = new RoomsManager(io);
  InitUsers(io)
  return {roomsManager}
}