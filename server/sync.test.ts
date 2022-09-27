import { Socket as ServerSocket } from "socket.io";
import { Socket as ClientSocket } from "socket.io-client";
import { createServer } from "http";
import { Server } from "socket.io";
import Client from "socket.io-client";
import { Diff, PersonalSyncHost, SyncHost } from "./sync";
import Room from "./room";
import RoomManager from "./room-manager";
import { AddressInfo } from "net";

let io: Server, serverSocket: ServerSocket, clientSocket: ClientSocket;
let port: number;

type ObjectWithOnceEvent = {
  once: (name: string, cb: (...args: any[]) => void) => void;
};
/** Returns a Promise that resolves once the socket emits the given event */
const socketEvent = (socket: ObjectWithOnceEvent, event: string) =>
  new Promise((r) => socket.once(event, r));
/** Returns a promise that resolves once the socket connects and rejects if it emits a connect error */
const socketConnect = (socket: ClientSocket | ServerSocket) =>
  Promise.race([
    socketEvent(socket, "connect"),
    rj(socketEvent(socket, "connect_error")),
  ]);

/** Returns a Promise that rejects then the other resolves or rejects */
const rj = (p: Promise<unknown>) =>
  new Promise((_, rej) => void p.then(rej).catch(rej));

/** Returns the network address for sockets on the client given a path */
let Address: (path?: string) => string;

beforeAll((done) => {
  const httpServer = createServer();
  io = new Server(httpServer);
  httpServer.listen(() => {
    port = (httpServer.address() as AddressInfo).port;
    Address = (path) => `http://localhost:${port}${path ?? ""}`;

    clientSocket = Client(Address());
    io.on("connection", (socket) => {
      serverSocket = socket;
    });
    clientSocket.on("connect", done);
  });
});

afterAll(() => {
  io.close();
  clientSocket.close();
});

describe("Basic Socket Tests", () => {
  it("should work", (done) => {
    clientSocket.on("hello", (arg) => {
      expect(arg).toBe("world");
      done();
    });
    serverSocket.emit("hello", "world");
  });

  it("should work (with ack)", (done) => {
    serverSocket.on("hi", (cb) => {
      cb("hola");
    });
    clientSocket.emit("hi", (arg: any) => {
      expect(arg).toBe("hola");
      done();
    });
  });
});
