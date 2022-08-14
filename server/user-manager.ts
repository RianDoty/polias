//Manages the creation, updating, etc. of sessions and users
import User from "./user";
import BaseManager from "./base-manager";
import { v4 as uuid } from "uuid";
import type Room from "./room";
import type { RoomSocket } from "./room-socket-types";

export default class UserManager extends BaseManager {
  users: Map<string, User>;

  constructor(room: Room) {
    super(room);

    this.users = new Map();

    this.io.use((socket, next) => {
      //Give the socket a user
      const { sessionID } = socket.handshake.auth;

      if (sessionID) {
        //Look up an existing user, if it doesn't exist, throw an error
        const existingUser = this.users.get(sessionID);
        if (!existingUser) next(new Error("Invalid SessionID"));

        socket.data.user = existingUser;
        socket.data.sessionID = sessionID;
        return next();
      }

      //Make a new user and session
      const { username } = socket.handshake.auth;
      const newUser = new User(this.room, { name: username });

      socket.data.user = newUser;
      socket.data.sessionID = uuid();
      next();
    });
  }

  onConnection(socket: RoomSocket) {
    const { user } = socket.data;
    if (!user)
      throw Error(
        "Socket should have a User before being registered by the UserManager!"
      );
    const { userID } = user;

    const { sessionID } = socket.data;
    if (!sessionID) throw Error("Socket expected to have a session ID!");

    socket.emit("session", { sessionID, userID });
    socket.join(userID);

    this.users.set(sessionID, user);
    this.room.syncManager.addUser(user);
  }

  findUser(userID: string) {
    return this.users.get(userID);
  }

  get userCount(): number {
    return this.users.size;
  }
}
