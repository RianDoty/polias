//Manages chat rooms
const ChatRoom = require("./chat-room");

class ChatRoomManager {
  constructor(io, roomCode) {
    /** The SocketIO Server. */
    this.io = io;
    /** The four-letter code for the user's current room.
     *
     * @type {string}
     */
    this.roomCode = roomCode;
    /**
     * All of the rooms that the manager is managing.
     *
     * @type {object}
     */
    this.rooms = {};
  }

  /**
   * Creates a new ChatRoom.
   *
   * @param {string} keyword The keyword the ChatRoom will be associated with.
   */
  createRoom(keyword) {
    this.rooms[keyword] = new ChatRoom(this.io, this.roomCode, keyword);
  }

  /**
   * Makes a Socket join a chosen ChatRoom.
   *
   * @param {Socket} socket The socket to make join.
   * @param {string} keyword The keyword of the ChatRoom to join.
   * @returns
   */
  joinSocket(socket, keyword) {
    if (!this.rooms[keyword]) return false;
    this.rooms[keyword].join(socket);

    socket.on("disconnect", () => this.leaveSocket(socket, keyword));
  }

  /**
   * Makes a Socket leave a chosen ChatRoom.
   *
   * @param {Socket} socket The socket to make leave.
   * @param {string} keyword The keyword of the ChatRoom to leave.
   */
  leaveSocket(socket, keyword) {
    this.rooms[keyword].leave(socket);
  }
}

module.exports = ChatRoomManager;
