const noop = () => {};

class SyncHost {
  constructor(io, keyword, startingData = {}) {
    this.io = io;
    this.keyword = keyword;
    this.data = startingData;

    io.on("connection", s => {
      s.on(`sync subscribe ${keyword}`, ack => this.subscribe(s, ack));
      s.on(`sync unsubscribe ${keyword}`, () => this.unsubscribe(s));
    });
  }

  create(key, value) {
    const { data, io, keyword } = this;
    data[key] = value;
    
    io.to(keyword).emit(`sync create ${keyword}`, key, value);
  }

  update(key, prop, value) {
    const { data, io, keyword } = this;

    if (value === null) {
      value = prop;
      data[key] = value;
    } else {
      if (!data[key]) return false;
      data[key][prop] = value;
    }

    io.to(keyword).emit(`sync update ${keyword}`, key, prop, value);
  }

  delete(key) {
    const { data, io, keyword } = this;

    delete data[key];

    io.to(keyword).emit(`sync delete ${keyword}`, key);
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
