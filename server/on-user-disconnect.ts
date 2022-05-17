import type { Namespace } from "socket.io";
import { Server, Socket } from "./socket-types";

const { saveSession } = require('./sessions')

function onDisconnect(io: Server | Namespace, socket: Socket) {
  saveSession(socket)
}

export default (io: Server | Namespace, socket: Socket) => {
  socket.on('disconnect', async () => {
    //If all of the sockets controlling that same user have been disconnected..
    const { userID } = socket.data;
    if (!userID) return
    const sameUserSockets = await io.in(userID).allSockets();
    const userHasDisconnected = sameUserSockets.size === 0;
    if (userHasDisconnected) {
      onDisconnect(io, socket)
    }
  })
}