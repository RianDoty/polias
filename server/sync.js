const clone = require('lodash.clonedeep')

class SyncHost {
  constructor(io, keyword, startingData = {}) {
    this.io = io;
    this.keyword = keyword;
    this.data = clone(startingData);
    this.sockets = {};

    //Connect all future and current sockets
    if (!io) return console.warn('SyncHost not given an IO server!')
    
    this.connectSocket = s => this.connect(s)
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
    this.sockets = {};
  }

  connect(socket) {
    const { keyword } = this;
    
    const subscribeSocket = ack => this.subscribe(socket, ack)
    const unsubscribeSocket = () => this.unsubscribe(socket)
    
    this.subscribeSocket.set(socket, subscribeSocket)
    this.unsubscribeSocket.set(socket, unsubscribeSocket)
    
    socket.on(`sync subscribe ${keyword}`, subscribeSocket);
    socket.on(`sync unsubscribe ${keyword}`, unsubscribeSocket);
    
    this.sockets[socket.id] = socket;
  }
  
  create(key, value) {
    const { data, io, keyword } = this;
    data[key] = clone(value);
    
    io.to(keyword).emit(`sync create ${keyword}`, key, value);
  }

  update(key, ...path) {
    const { data, io, keyword } = this;

    
    try {
      const dPath = [...path]
      const value = dPath.pop();
      const prop = dPath.pop();
      
      let current = data;
      for (const dir of dPath) {
        current = current[dir];
        
        io.to(keyword).emit(`sync update ${keyword}`, key, ...path);
      }
      
      current[prop] = value;
      
    } catch {
      console.error(`Error in update sync with args ${path}`)
    }
  }

  delete(key) {
    const { data, io, keyword } = this;

    delete data[key];

    io.to(keyword).emit(`sync delete ${keyword}`, key);
  }
  
  set(data) {
    const {io, keyword} = this;
    this.data = clone(data);
    io.to(keyword).emit(`sync set ${keyword}`, data);
  }

  subscribe(socket, ack) {
    //Return the current value to the client as the initial value
    if (ack) ack(this.data);
    //The client is sent further changes
    socket.join(this.keyword);
  }

  unsubscribe(socket) {
    //Stop sending the client changes
    socket.leave(this.keyword);
  }
}

module.exports = SyncHost;