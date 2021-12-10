const InitUsers = require('./user-manager')
const InitRooms = require('./rooms-manager')

module.exports = (io)=>{
  InitRooms(io)
  InitUsers(io)
}