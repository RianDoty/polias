//Manages the creation of users and tracking of sessions
import User from "./user";
import BaseManager from "./base-manager";
import { v4 as uuid } from "uuid";
import type Room from "./room";
import type { RoomSocket } from "./room-socket-types";

export default class UserManager extends BaseManager {
  users: Map<string, User>;
  host?: User;

  constructor(room: Room) {
    super(room);

    this.users = new Map();

    this.io.use((socket, next) => {
      //Give the socket a user
      const { sessionID } = socket.handshake.auth;

      //If the socket has a session
      if (sessionID) {
        //Look up an existing user, if it doesn't exist, throw an error
        const existingUser = this.users.get(sessionID);
        if (!existingUser) return next(new Error("Invalid SessionID"));

        socket.data.user = existingUser;
        socket.data.sessionID = sessionID;
        return next();
      }

      //Make a new user and session
      try {
        const { username } = socket.handshake.auth;
        const newUser = new User(this.room, { name: username });

        socket.data.user = newUser;
        socket.data.sessionID = uuid();
        next();
      } catch (err) {
        if (err instanceof Error) next(err);
      }
    });

    this.io.on("connection", (socket: RoomSocket) => {
      try {
        const { user } = socket.data;
        if (!user)
          throw Error(
            "Socket should have a User before being registered by the UserManager!"
          );
        const { userID } = user;

        const { sessionID: sessionId } = socket.data;
        if (!sessionId) throw Error("Socket expected to have a session ID!");

        socket.join(sessionId);
        this.io.to(sessionId).emit("session", { sessionID: sessionId, userID });

        if (!this.users.has(sessionId)) {
          //A new user has joined!
          this.users.set(sessionId, user);
          this.room.syncManager.addUser(user);
        }
      } catch (err) {
        socket.disconnect();
        console.error("Error while socket join:");
        console.error(err);
      }
    });
  }

  getHost(): User | undefined {
    //Return the pre-set host or the first user
    return this.host || this.users.values().next().value;
  }

  findUser(sessionId: string): User | undefined {
    return this.users.get(sessionId);
  }

  get userCount(): number {
    return this.users.size;
  }
}
