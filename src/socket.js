import io from 'socket.io-client';
import initSession from './session'

const socket = io()

//Logging
// socket.onAnyOutgoing((event, ...args) => {
//   if (event !== 'log') socket.emit('log', event, ...args)
// })

initSession(socket);

export default socket