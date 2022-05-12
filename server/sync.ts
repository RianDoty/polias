import { Namespace } from "socket.io";
import Base from "./base";

import type { Socket as BaseSocket, Server as BaseServer } from './socket-types'
import type { RoomSocket, RoomServer } from './room-socket-types'
import { SyncManager as SyncManagerType } from "./sync-manager";

const SyncManager : SyncManagerType = require('./sync-manager')();

type Socket = BaseSocket | RoomSocket
type Server = BaseServer | RoomServer

const clone = require('lodash.clonedeep')

class SyncHost<V> extends Base {
  keyword: string
  data: {[key: string]: V}
  sockets: Set<Socket>
  subscribeSocket: Map<Socket, (ack: (arg0: {[key: string]: V}) => void)=>void>
  unsubscribeSocket: Map<Socket, ()=>void>

  constructor(io: Server, keyword: string, def: {[key: string]: V} = {}) {
    super(io)

    this.keyword = keyword;
    this.data = def
    this.sockets = new Set();

    this.subscribeSocket = new Map()
    this.unsubscribeSocket = new Map()
  }

  route(callback: (...args: any[]) => void): (keyword: string, ...args: any[]) => void {
    return (keyword: string, ...args) => {
      if (this.keyword === keyword) {
        callback(...args)
      }
    }
  }

  connect(socket: BaseSocket | RoomSocket) {
    const { keyword } = this;
    
    const subscribeSocket = this.route((ack: (arg0: {[key:string]: V})=>void) => this.subscribe(socket, ack))
    const unsubscribeSocket = this.route(() => this.unsubscribe(socket))
    
    this.subscribeSocket.set(socket, subscribeSocket)
    this.unsubscribeSocket.set(socket, unsubscribeSocket)
    
    socket.on('sync_subscribe')
    
    this.sockets.add(socket)
  }
  
  create(key: string, value: V) {
    const { data, io, keyword } = this;
    data[key] = clone(value);
    
    io.to(keyword).emit('sync_create', keyword, key, value);
  }

  update(...path: any[]) {
    const { data, io, keyword } = this;

    
    try {
      const value = path.pop();
      const prop = path.pop();
      const obj = path.reduce((c: {[key: string]: {[key: string]: any}}, k: string) => c[k], data)
      
      obj[prop] = value
      io.to(keyword).emit(`sync_update`, keyword, ...path, prop, value)
    } catch {
      console.error(`Error in update sync with args ${path}`)
    }
  }

  delete(key: string) {
    const { data, io, keyword } = this;

    delete data[key];

    io.to(keyword).emit('sync_delete', keyword, key);
  }
  
  set(data: {[key: string]: V}) {
    const {io, keyword} = this;
    this.data = clone(data);
    io.to(keyword).emit(`sync_set`, keyword, data);
  }

  subscribe(socket: Socket, ack: (arg0: {[key: string]: V})=>void ) {
    //Return the current value to the client as the initial value
    if (ack) ack(this.data);
    //The client is sent further changes
    socket.join(this.keyword);
  }

  unsubscribe(socket: Socket) {
    //Stop sending the client changes
    socket.leave(this.keyword);
  }
}

export default SyncHost;