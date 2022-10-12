//Manages the creation of users and tracking of sessions
import User from "./user";
import BaseManager from "./base-manager";
import { v4 as uuid } from "uuid";
import type Room from "./room";
import { EventEmitter } from "events";
import { Socket } from "socket.io";

export default class UserManager extends BaseManager {
  users: Map<string, User>;
  host?: User;
  events: EventEmitter;

  constructor(room: Room) {
    super(room);

    this.users = new Map();
    this.events = new EventEmitter();
  }

  /** Enables the UserManager, and adds middleware and listeners to its room's Namespace. */
  listen() {
    // Gives the socket a user
    this.io.use((socket, next) => {
      const { sessionId } = socket.handshake.auth;

      //If the socket has a session
      if (sessionId) {
        console.log("Session provided");
        //Look up an existing user, if it doesn't exist, throw an error
        const existingUser = this.users.get(sessionId);
        if (!existingUser) {
          console.error("Provided session does not exist!");
          return next(new Error("Invalid SessionId"));
        }
        console.log("Provided session exists");

        socket.data.user = existingUser;
        socket.data.sessionId = sessionId;
        return next();
      }

      //Else, make a new user and session
      try {
        const { username } = socket.handshake.auth;
        if (
          typeof username !== "string" ||
          username.replace(/\s/g, "").length === 0
        )
          return next(Error("Invalid Username"));
        const newUser = new User(this.room, { name: username });

        socket.data.user = newUser;
        socket.data.sessionId = uuid();
        console.log("New user with SID %s", socket.data.sessionId);
        next();
      } catch (err) {
        if (err instanceof Error) next(err);
      }
    });

    this.io.on("connection", (socket: Socket) => {
      try {
        //Socket should always have a registered User before being checked in
        const user: User = socket.data.user;
        if (!user)
          throw Error(
            "Socket should have a User before being registered by the UserManager!"
          );
        const { userId } = user;

        const sessionId: string = socket.data.sessionId;
        if (!sessionId) throw Error("Socket expected to have a session ID!");

        socket.join(sessionId);
        this.io.to(sessionId).emit("session", { sessionId, userId });

        socket.on("disconnect", async () => {
          if ((await this.io.in(sessionId).fetchSockets()).length === 0) {
            //There are no more sockets controlling this user, so it is not present.
            this.events.emit("user-leave");
            this.room.syncManager.updateUser(user, { present: false });
          }
        });

        if (!this.users.has(sessionId)) {
          //A new user has joined!
          this.events.emit("user-join");
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

  onJoin(callback: (user: User) => void) {
    this.events.on("user-join", callback);
    return this;
  }

  offJoin(callback: (user: User) => void) {
    this.events.off("user-join", callback);
    return this;
  }

  onceJoin(callback: (user: User) => void) {
    this.events.once("user-join", callback);
    return this;
  }
}
