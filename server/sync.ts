import { Namespace, RemoteSocket, Server, Socket } from "socket.io";
import Base from "./base";

const clone = require('lodash.clonedeep')

class SyncHost<V> extends Base {
  keyword: string
  data: {[key: string]: V}
  sockets: Set<Socket>
  connectSocket: (s: Socket | RemoteSocket<{}>) => void
  subscribeSocket: Map<Socket, (ack: (arg0: {[key: string]: V}) => void)=>void>
  unsubscribeSocket: Map<Socket, ()=>void>

  constructor(io: Server | Namespace, keyword: string, def: {[key: string]: V} = {}) {
    super(io)

    this.keyword = keyword;
    this.data = def
    this.sockets = new Set();
    

    //Connect all future and current sockets
    if (!io) throw 'SyncHost not given an IO server!'
    
    this.connectSocket = (s: Socket | RemoteSocket<any>) => {
      if (s instanceof Socket) {
        this.connect(s)
      }
    }
    io.fetchSockets().then(s => s.forEach(this.connectSocket));
    io.on("connection", this.connectSocket);

    this.subscribeSocket = new Map()
    this.unsubscribeSocket = new Map()
  }
  
  close() {
    this.io.off('connection', this.connectSocket);
    
    const {keyword, subscribeSocket, unsubscribeSocket} = this;
    Object.values(this.sockets).forEach(s => {
      s.off(`sync subscribe ${keyword}`, subscribeSocket.get(s));
      s.off(`sync unsubscribe ${keyword}`, unsubscribeSocket.get(s));
    })
    this.sockets = new Set();
  }

  connect(socket: Socket) {
    const { keyword } = this;
    
    const subscribeSocket = (ack: (arg0: {[key:string]: V})=>void) => this.subscribe(socket, ack)
    const unsubscribeSocket = () => this.unsubscribe(socket)
    
    this.subscribeSocket.set(socket, subscribeSocket)
    this.unsubscribeSocket.set(socket, unsubscribeSocket)
    
    socket.on(`sync subscribe ${keyword}`, subscribeSocket);
    socket.on(`sync unsubscribe ${keyword}`, unsubscribeSocket);
    
    this.sockets.add(socket)
  }
  
  create(key: string, value: V) {
    const { data, io, keyword } = this;
    data[key] = clone(value);
    
    io.to(keyword).emit(`sync create ${keyword}`, key, value);
  }

  update(...path: any[]) {
    const { data, io, keyword } = this;

    
    try {
      const value = path.pop();
      const prop = path.pop();
      const obj = path.reduce((c: {[key: string]: {[key: string]: any}}, k: string) => c[k], data)
      
      obj[prop] = value
      io.to(keyword).emit(`sync update ${keyword}`, ...path, prop, value)
    } catch {
      console.error(`Error in update sync with args ${path}`)
    }
  }

  delete(key: string) {
    const { data, io, keyword } = this;

    delete data[key];

    io.to(keyword).emit(`sync delete ${keyword}`, key);
  }
  
  set(data: {[key: string]: V}) {
    const {io, keyword} = this;
    this.data = clone(data);
    io.to(keyword).emit(`sync set ${keyword}`, data);
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