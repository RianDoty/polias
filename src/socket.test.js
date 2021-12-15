const { createServer } = require("http");
const { Server } = require("socket.io");
const Client = require("socket.io-client");
const networking = require('../server/networking.js');
const roomsManager = require('../server/rooms-manager.js')

describe("Polias", () => {
  let io, serverSocket, clientSocket;

  beforeAll((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    networking(io);
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
  test('transfers data', done => {
    clientSocket.on('hello', arg => {
      expect(arg).toBe('world')
      done()
    })

    serverSocket.emit('hello', 'world')
  })

  test('creates rooms', done => {
    clientSocket.emit()
  })
});