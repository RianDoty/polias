import { SyncHost } from './sync'
import { Server, Socket as ServerSocket } from 'socket.io'
import Client, { Socket as ClientSocket } from 'socket.io-client'
import { createServer } from 'http'

let io: Server, serverSocket: ServerSocket, clientSocket: ClientSocket
beforeAll((done) => {
    const httpServer = createServer()
    io = new Server(httpServer)
    httpServer.listen(() => {
         // eslint-disable-next-line
        const address = httpServer.address()
        if (typeof address === 'string' || !address?.port) throw Error('Invalid Address!')
        const port = address.port;
        
        clientSocket = Client(`http://localhost:${port}`)
        
        io.once('connection', (s) => {
            serverSocket = s
        })
        clientSocket.once('connection', done)
    })
})

test('contains nothing', () => {
    const host = new SyncHost(io.of('/'), 'room_users', {})
    
    expect(host.data)
})