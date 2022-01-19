const increment = require("./debug");
const clone = require('lodash.clonedeep')

class SyncHost {
  constructor(io, keyword, startingData = {}) {
    /** The socketIO server. */
    this.io = io;
    /** 
     * The string associated with this SyncHost that the client should already know how to find.
     * 
     * @type {string}
    */
    this.keyword = keyword;
    /** The internal data that is synchronized with the client. */
    this.data = clone(startingData);
    this.sockets = {};

    //Connect all future and current sockets
    if (!io) return console.warn('SyncHost not given an IO server!')
    
    this.connectSocket = s => this.connect(s)
    io.fetchSockets().then(s => s.forEach(this.connectSocket));
    io.on("connection", this.connectSocket);
    increment('sync connection binds');//performance debug

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

  /**
   * Connects a socket to the sync host.
   * 
   * @param {object} socket The socket to connect. 
   */
  connect(socket) {
    increment('sync connections')
    const { keyword } = this;
    
    const subscribeSocket = ack => this.subscribe(socket, ack)
    const unsubscribeSocket = () => this.unsubscribe(socket)
    
    this.subscribeSocket.set(socket, subscribeSocket)
    this.unsubscribeSocket.set(socket, unsubscribeSocket)
    
    socket.on(`sync subscribe ${keyword}`, subscribeSocket);
    socket.on(`sync unsubscribe ${keyword}`, unsubscribeSocket);
    
    this.sockets[socket.id] = socket;
  }

  /**
   * Signals to create an entry in the sync.
   * 
   * @param {string} key The key to create the entry in.
   * @param {any} value The entry to create.
   */
  create(key, value) {
    const { data, io, keyword } = this;
    data[key] = clone(value);
    
    io.to(keyword).emit(`sync create ${keyword}`, key, value);
  }

  /**
   * Signals to update a prop of one entry from the sync.
   * 
   * @param {string} key The key of the entry.
   * @param {string} prop The prop of the edited value.
   * @param {any} value The new value.
   * @returns 
   */
  update(key, prop, value) {
    const { data, io, keyword } = this;

    if (value === undefined) {
      if (typeof data[key] === 'object' && typeof value !== 'object') throw Error('Object store overwritten!')
      value = prop;
      data[key] = value;
    } else {
      if (!data[key]) return console.warn(`data assignment to undefined key : ${key} ${prop} ${value}`);
      data[key][prop] = value;
    }

    io.to(keyword).emit(`sync update ${keyword}`, key, prop, value);
  }

  /**
   * Signals to remove an entry from the sync.
   * 
   * @param {String} key The key of the entry to remove. 
   */
  delete(key) {
    const { data, io, keyword } = this;

    delete data[key];

    io.to(keyword).emit(`sync delete ${keyword}`, key);
  }
  
  /**Completely overrides the data with new data.*/
  set(data) {
    const {io, keyword} = this;
    this.data = clone(data);
    io.to(keyword).emit(`sync set ${keyword}`, data);
  }

  /**
   * Subscribes a socket to the SyncHost, and serves it the current data.
   * 
   * @param {object} socket The socket to subscribe.
   * @param {function} ack Function to fire back to.
   */
  subscribe(socket, ack) {
    //Return the current value to the client as the initial value
    if (ack) ack(this.data);
    //The client is sent further changes
    socket.join(this.keyword);
  }

  /**
   * Unsubscribes a socket from the SyncHost, and stops sending it updates.
   * 
   * @param {object} socket The socket to unsubscribe. 
   */
  unsubscribe(socket) {
    //Stop sending the client changes
    socket.leave(this.keyword);
  }
}

module.exports = SyncHost;