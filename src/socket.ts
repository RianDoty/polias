import io from 'socket.io-client';
import { BaseSocket } from './socket-types';

const socket: BaseSocket = io()

//Logging
socket.onAny((event, ...args) => {
  if (event !== 'log') socket.emit('log', event, ...args)
})

export default socket