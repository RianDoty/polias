const { createServer } = require("http");
const { Server } = require("socket.io");
const { act, render } = require("@testing-library/react")

const Client = require("socket.io-client");
const networking = require('../server/networking.js');
const roomsManager = require('../server/rooms-manager.js')
const SyncHost = require('../server/sync')
import useSync from './hooks/sync'

function sleep(ms) {
  return new Promise(resolve => setTimeout(()=>resolve(),ms))
}

async function waitFor(cb, timeout) {
  const timestep = 100;
  let timeSpent = 0;
  let timedOut = false;
  
  while (true) {
    try {
      await sleep(timestep)
      timeSpent += timestep;
      cb();
      break;
    } catch {}
    if (timeSpent >= timeout) {
      timedOut = true;
      break;
    }
  }
  
  if (timedOut) {

  }
}

function renderHook(hook, args) {
  let result = {};

  function TestComponent({ hookArgs }) {
    result.current = hook(...hookArgs);
    return null;
  }

  render(<TestComponent hookArgs={args} />);

  return result;
}

describe("Socket tests", () => {
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
  //User
  let myUser;
  test('User is created for sockets', () => {
    myUser = serverSocket.user;
    expect(myUser.socket).toBe(serverSocket);
  })
  
  test('User is a valid EventEmitter', ()=>{
    let test = false;
    serverSocket.user.on('test', ()=>test = true);
    serverSocket.user.emit('test')
    expect(test).toBe(true)
  })

  let myRoom;
  test('RoomsManager creates rooms', done => {
    clientSocket.emit('create-room', 'foo', code => {
      expect(code).toMatch(/[A-Z]+/) //Expect the code to be a string of one or more capital letters
      expect(roomsManager.roomExists(code)).toBe(true);
      myRoom = roomsManager.getRoom(code);
      expect(myRoom).toBeTruthy()
      done()
    });
  });
  
  
  
  describe('SyncHost tests', () => {
    let mySyncHost
    
    beforeAll(() => {
      mySyncHost = new SyncHost(io, 'test', {foo: 'foostring'})
    })
    
    afterAll(() => {

    })
    
    it('should transmit basic data on subscribe', async()=>{
      const result = renderHook(useSync, 'test')
      await waitFor(()=>{
        expect(result.current[0]).toEqual({foo: 'foostring'})
      }, 2000)
    })
  })
});