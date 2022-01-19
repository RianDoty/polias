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
    const defaultHostValue ={foo: 'foostring', foo2:{foo3:'foostring2'}}

    beforeEach(() => {
      mySyncHost = new SyncHost(io, 'test', defaultHostValue)
    })

    afterEach(() => {
      mySyncHost.close()
      mySyncHost = null
    })
    
    it('should transmit basic data on subscribe', (done)=>{
      clientSocket.emit('sync subscribe test', data => {
        expect(data).toEqual(defaultHostValue)
        done()
      })
    })

    it('should transfer updates for set, create, update, & delete while mutating internal data', async () => {
      const setData = {foo: 'foostring', foo2:{foo3:'foostring2'}}; 
      const createArgs = ['foo4', {foo5: 'foostring3'}]
      const updateArgs = ['foo2', 'foo3', 'foostring4']
      const deleteArg = 'foo'

      await new Promise(resolve => clientSocket.emit('sync subscribe test', data => resolve()))

      const setPromise = new Promise(resolve => clientSocket.once('sync set test', data => {
        expect(data).toEqual(setData)
        resolve()
      }))

      const createPromise = new Promise(resolve => clientSocket.once('sync create test', (key, value) => {
        expect(key).toBe(createArgs[0])
        expect(value).toEqual(createArgs[1])
        resolve()
      }))

      const updatePromise = new Promise(resolve => clientSocket.once('sync update test', (key, prop, value) => {
        expect(key).toBe(updateArgs[0])
        expect(prop).toBe(updateArgs[1])
        expect(value).toBe(updateArgs[2])
        resolve()
      }));

      const deletePromise = new Promise(resolve => clientSocket.once('sync delete test', key => {
        expect(key).toBe(deleteArg)
        resolve()
      }))

      mySyncHost.set(setData)
      expect(mySyncHost.data).toEqual({foo: 'foostring', foo2:{foo3:'foostring2'}})
      await setPromise
      mySyncHost.create(...createArgs)
      expect(mySyncHost.data).toEqual({foo: 'foostring', foo2:{foo3:'foostring2'}, foo4:{foo5:'foostring3'}})
      await createPromise
      mySyncHost.update(...updateArgs)
      expect(mySyncHost.data).toEqual({foo: 'foostring', foo2:{foo3:'foostring4'}, foo4:{foo5:'foostring3'}})
      await updatePromise
      mySyncHost.delete(deleteArg)
      expect(mySyncHost.data).toEqual({foo2:{foo3:'foostring4'}, foo4:{foo5:'foostring3'}})
      await deletePromise
    })
  })


});