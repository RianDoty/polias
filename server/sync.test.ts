import { Socket as ServerSocket } from "socket.io";
import { Socket as ClientSocket } from 'socket.io-client'
import { createServer } from "http";
import { Server } from "socket.io"
import Client from "socket.io-client";
import { Diff, SyncHost } from "./sync";
import { renderHook } from '@testing-library/react-hooks'
import useSync from '../src/hooks/sync';


let io: Server, serverSocket: ServerSocket, clientSocket: ClientSocket;

beforeAll((done) => {
    const httpServer = createServer() as any;
    io = new Server(httpServer);
    httpServer.listen(() => {
        const port = httpServer.address().port;
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

describe('Basic Socket Tests', () => {
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
})

describe('Server-Only SyncHost Tests', () => {
    let host: SyncHost<any>;
    
    beforeEach(() => {
        host = new SyncHost(io.of('/'), '' as any, {})
    })

    afterEach(() => {
        host.close();
    })

    test('Basic initialization', () => {
        expect(host.data).toEqual({})
        expect(host.keyword).toBe('')
    })

    test('Should add data when requested', () => {
        host.update({hello: 'world'})
        expect(host.data).toEqual({hello: 'world'})
    })

    test('Should add and remove data when requested', () => {
        //Add data
        host.update({hello: 'world'})
        expect(host.data).toEqual({hello: 'world'})

        //Remove data
        host.update({hello: undefined})
        expect(host.data).toEqual({})
    })

    test('Should add individual data while keeping unmentioned data', () => {
        host.update({hello: 'world'})
        host.update({foo: 'bar'})
        expect(host.data).toEqual({hello: 'world', foo: 'bar'})
    })

    test('Should add and remove nested data', () => {
        //Add a table
        host.update({tbl: {}})
        expect(host.data).toEqual({tbl: {}})

        //Add an entry to the table
        host.update({tbl: {one: 1}})
        expect(host.data).toEqual({tbl: {one: 1}})

        //Add another entry to the table
        host.update({tbl: {two: 2}})
        expect(host.data).toEqual({tbl: {one: 1, two: 2}})
    })
})

describe('Server-Client SyncHost Tests', () => {
    let host: SyncHost<any>

    beforeEach(() => {
        host = new SyncHost(io.of('/'), 'foobar' as any, {})
    })

    afterEach(() => {
        host.close()
    })

    test('Should connect', async () => {
        const { result, waitForNextUpdate } = renderHook(() => useSync(2))
    })
})