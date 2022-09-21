import { Socket as ServerSocket } from "socket.io";
import { Socket as ClientSocket } from "socket.io-client";
import { createServer } from "http";
import { Server } from "socket.io";
import Client from "socket.io-client";
import { Diff, PersonalSyncHost, SyncHost } from "./sync";
import Room from "./room";
import RoomManager from "./room-manager";

let io: Server, serverSocket: ServerSocket, clientSocket: ClientSocket;
let port: number;

beforeAll((done) => {
  const httpServer = createServer() as any;
  io = new Server(httpServer);
  httpServer.listen(() => {
    port = httpServer.address().port;
    clientSocket = Client(`http://localhost:${port}`);
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
  test("should work", (done) => {
    clientSocket.on("hello", (arg) => {
      expect(arg).toBe("world");
      done();
    });
    serverSocket.emit("hello", "world");
  });

  test("should work (with ack)", (done) => {
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
    host = new SyncHost(io.of("/"), "" as any, {});
  });

  afterEach(() => {
    host.close();
  });

  test("Basic initialization", () => {
    expect(host.data).toEqual({});
    expect(host.keyword).toBe("");
  });

  test("Should add data when requested", () => {
    host.update({ hello: "world" });
    expect(host.data).toEqual({ hello: "world" });
  });

  test("Should add and remove data when requested", () => {
    //Add data
    host.update({ hello: "world" });
    expect(host.data).toEqual({ hello: "world" });

    //Remove data
    host.update({ hello: undefined });
    expect(host.data).toEqual({});
  });

  test("Should add individual data while keeping unmentioned data", () => {
    host.update({ hello: "world" });
    host.update({ foo: "bar" });
    expect(host.data).toEqual({ hello: "world", foo: "bar" });
  });

  test("Should add and remove nested data", () => {
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
});

describe("Server-Client SyncHost Tests", () => {
  let host: SyncHost<any>;
  let syncClientSocket: ClientSocket;

  beforeEach((done) => {
    host = new SyncHost(io.of("/"), "foobar" as any, {});

    syncClientSocket = Client(`http://localhost:${port}${host.nsp.name}`);

    host.nsp.on("connection", () => done);
  });

  afterEach(() => {
    host.close();
    syncClientSocket.close();
  });

  test("Should pass base data to client", (done) => {
    syncClientSocket.once("sync_data", (recievedData) => {
      expect(recievedData).toEqual({});
      done();
    });
  });

  test("Should pass diffs to client", (done) => {
    const thisDiff = { foo: "bar" };

    host.update(thisDiff);
    syncClientSocket.once("sync_diff", (recievedDiff) => {
      expect(recievedDiff).toEqual({ foo: "bar" });
      done();
    });
  });
});

describe("Server-Client PersonalSyncHost tests", () => {
  let roomManager: RoomManager;
  let room: Room;
  let host: PersonalSyncHost<any>;
  let syncClientSocket1: ClientSocket;
  let syncClientSocket2: ClientSocket;

  beforeEach(async () => {
    roomManager = new RoomManager(io.of("/"));
    room = new Room(roomManager, { code: "AAAA" });
    host = new PersonalSyncHost(room, "foobar" as any, { foo: "bar" });

    const address = `http://localhost:${port}${host.nsp.name}`;
    syncClientSocket1 = Client(address);
    syncClientSocket2 = Client(address);

    await new Promise((r) => host.nsp.once("connection", r));
    await new Promise((r) => host.nsp.once("connection", r));
  });

  it("Should provide both sockets with default data", async () => {
    const nextData = (socket: ClientSocket) =>
      new Promise((r) => socket.on("sync_data", r));
    expect(await nextData(syncClientSocket1)).toEqual({ foo: "bar" });
    expect(await nextData(syncClientSocket2)).toEqual({ foo: "bar" });
  });
});
