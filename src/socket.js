import io from 'socket.io-client';
import initSession from './session'
const { localStorage } = window;

const socket = io()

initSession(socket);

export default socket