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

type ObjectWithOnceEvent = { once: (name: string, cb: (...args: any[]) => void) => void }
/** Returns a Promise that resolves once the socket emits the given event */
const socketEvent = (socket: ObjectWithOnceEvent, event: string) => new Promise(r => socket.once(event, r))
/** Returns a promise that resolves once the socket connects and rejects if it emits a connect error */
const socketConnect = (socket: ClientSocket | ServerSocket) => Promise.race([socketEvent(socket, 'connect'), rj(socketEvent(socket, 'connect_error'))])

/** Returns a Promise that rejects then the other resolves or rejects */
const rj = (p: Promise<unknown>) => new Promise((_,rj) => p.then(rj).catch(rj))

/** Returns the network address for sockets on the client given a path */
let Address: (path?: string) => string

beforeAll((done) => {
  const httpServer = createServer();
  io = new Server(httpServer);
  httpServer.listen(() => {
    port = (httpServer.address() as AddressInfo).port;
    Address = (path) => `http://localhost:${port}${path}`
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

describe("Server-Only SyncHost Tests", () => {
  let host: SyncHost<any>;

  beforeEach(() => {
    host = new SyncHost(io.of("/"), "foobar" as any, {});
  });

  afterEach(() => {
    host.close();
  });

  it("Initializes correctly", () => {
    expect(host.data).toEqual({});
    expect(host.keyword).toBe("foobar");
  });

  it("Adds data when requested", () => {
    host.update({ hello: "world" });
    expect(host.data).toEqual({ hello: "world" });
  });

  it("Adds and removes data when requested", () => {
    //Add data
    host.update({ hello: "world" });
    expect(host.data).toEqual({ hello: "world" });

    //Remove data
    host.update({ hello: undefined });
    expect(host.data).toEqual({});
  });

  it("Adds new data while keeping unmentioned data", () => {
    //Add a value
    host.update({ hello: "world" });

    //Add a seperate value
    host.update({ foo: "bar" });

    //Both should be present in the data
    expect(host.data).toEqual({ hello: "world", foo: "bar" });
  });

  it("Adds and removes nested data", () => {
    //Add a table
    host.update({ tbl: {} });
    expect(host.data).toEqual({ tbl: {} });

    //Add an entry to the table
    host.update({ tbl: { one: 1 } });
    expect(host.data).toEqual({ tbl: { one: 1 } });

    //Add another entry to the table
    host.update({ tbl: { two: 2 } });
    expect(host.data).toEqual({ tbl: { one: 1, two: 2 } });
  });

  it('Closes cleanly', () => {
    const connectionListenerCount = () => host.nsp.listenerCount('connect') + host.nsp.listenerCount('connection')

    expect(connectionListenerCount()).toBeGreaterThan(0)
    host.close()
    expect(connectionListenerCount()).toBe(0)
  })
});

describe("Server-Client SyncHost Tests", () => {
  let host: SyncHost<any>;
  let syncClientSocket: ClientSocket;
  let firstData: Promise<unknown>

  beforeEach((done) => {
    host = new SyncHost(io.of("/"), "foobar" as any, { foo: 'bar' });

    syncClientSocket = Client(`http://localhost:${port}${host.nsp.name}`);

    syncClientSocket.on('connect', done)

    firstData = socketEvent(syncClientSocket, 'sync_data')
  });

  afterEach(() => {
    host.close();
    syncClientSocket.close();
  });

  it("Passes base data to client", async () => {
    //Data is passed before test starts
    expect(await firstData).toEqual({ foo: 'bar' })
  });

  it("Passes diffs to client", async () => {
    const thisDiff = { fizz: "buzz" };

    const nextRecievedDiff = socketEvent(syncClientSocket, 'sync_diff')
    host.update(thisDiff);
    expect(await nextRecievedDiff).toEqual({ fizz: 'buzz' })
  });
});

describe("Server-Client PersonalSyncHost tests", () => {
  let roomManager: RoomManager;
  let room: Room;
  let host: PersonalSyncHost<any>;
  let syncClientSocket1: ClientSocket;
  let syncClientSocket2: ClientSocket;
  let firstData1: Promise<unknown>
  let firstData2: Promise<unknown>

  beforeEach(async () => {
    roomManager = new RoomManager(io.of("/"));
    room = new Room(roomManager, { code: "AAAA" });
    host = new PersonalSyncHost(room, "foobar" as any, { foo: "bar" });

    async function initSocket() {
      const roomSocket = Client(Address(room.ioNamespace.name))
      const sessionEvent = socketEvent(roomSocket, 'session')
      await socketConnect(roomSocket)
      const session = (await sessionEvent) as {userId: string, sessionId: string}

      const syncSocket = Client(Address(host.nsp.name), {auth: {sessionId: session.sessionId}})

      const firstData = socketEvent(syncSocket, 'sync_data')

      await socketConnect(syncSocket)

      return {socket: syncSocket, firstData}
    }
    const socketData = await Promise.all([initSocket(), initSocket()])

    syncClientSocket1 = socketData[0].socket
    firstData1 = socketData[0].firstData
    syncClientSocket2 = socketData[1].socket
    firstData2 = socketData[1].firstData
  });

  afterEach(() => {
    host.close()
    syncClientSocket1.close()
    syncClientSocket2.close()
  })

  it("Provides both sockets with default data", async () => {
    expect(await firstData1).toEqual({ foo: "bar" });
    expect(await firstData2).toEqual({ foo: "bar" });
  });

  // it('Provides each socket with unique diffs', () => {
  // })
});
