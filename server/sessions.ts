import SessionStore from "./session-store";
import { v4 as uuid } from "uuid";
import { Socket } from "socket.io";

module.exports.initSessions = (io) => {
  io.use((socket: Socket, next) => {
    const { sessionID } = socket.handshake.auth;

    if (sessionID) {
      const session = SessionStore.findSession(sessionID);
      //Assign an existing session
      if (session) {
        socket.sessionID = sessionID;
        socket.userID = session.userID;
        socket.username = session.username;
        return next();
      }
    }

    const { username } = socket.handshake.auth;
    if (!username) {
      console.log('erroring, bad username')
      return next(new Error("Invalid Username"));
    }

    console.log('making new session for socket')
    //Make a new session
    socket.sessionID = uuid()
    socket.userID = uuid()
    socket.username = username;

    return next();
  });
};

module.exports.saveSession = (io, socket) => {
  const { username, userID } = socket;
  
  SessionStore.saveSession(socket.sessionID, {
    userID,
    username,
    connected: false
  })
}