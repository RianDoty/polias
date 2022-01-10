const { createServer } = require("http");
const { Server } = require("socket.io");
const Client = require("socket.io-client");
const networking = require('../server/networking.js');
const roomsManager = require('../server/rooms-manager.js')


describe("Polias", () => {
  let io, serverSocket, clientSocket, roomsManager;

  beforeAll((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    roomsManager = networking(io).roomsManager;
    httpServer.listen(() => {
      const port = httpServer.address().port;
      clientSocket = new Client(`http://localhost:${port}`);
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


  //Tests
  test('Socket transfers data', done => {
    clientSocket.on('hello', arg => {
      expect(arg).toBe('world')
      done()
    })

    serverSocket.emit('hello', 'world')
  })

  // Networking
  let myUser;
  test('User is created for sockets', () => {
    myUser = serverSocket.user;
    expect(myUser.socket).toBe(serverSocket);
  })

  let myRoom;
  test('RoomsManager creates rooms', done => {
    clientSocket.emit('create-room', 'foo', code => {
      expect(code).toMatch(/[A-Z]+/)
      expect(roomsManager.roomExists(code)).toBe(true)
      myRoom = roomsManager.getRoom(code);
      expect(myRoom).toBeTruthy()
      done()
    })
  })

  test('Room accepts users', done => {

  })
});