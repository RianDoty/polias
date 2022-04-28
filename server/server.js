const express = require("express");
const path = require("path");
const app = express();
const http = require("http").Server(app);
const { v4: uuid } = require("uuid");
const { Server } = require("socket.io");
const io = new Server(http);

const SessionStore = require("./session-store");
const RoomManager = require("./room-manager")(io);

//Sessions
io.use((socket, next) => {
  const { sessionID } = socket.handshake.auth;

  if (sessionID) {
    console.log('session ID provided. Finding session...')
    const session = SessionStore.findSession(sessionID);

    if (session) {
      console.log('session found!')
      //Restore old session
      socket.sessionID = sessionID;
      socket.userID = session.userID;
      socket.roomCode = session.roomCode;
      socket.username = session.username;

      return next();
    }
    console.log('session not found on the server.')
  }

  const { username } = socket.handshake.auth;
  if (!username) return next(new Error("Invalid username"));

  //Create new session
  socket.sessionID = uuid();
  socket.userID = uuid();
  socket.username = username;
  socket.roomCode = null;

  next();
});

io.on("connection", (socket) => {
  const { sessionID, userID, roomCode, username } = socket;
  const session = { sessionID, userID, roomCode, username };
  
  socket.emit("session", session);
  SessionStore.saveSession(sessionID, session)

  socket.on("room:create", (roomData) => {
    try {
      console.log("creating a room...");
      const { code } = RoomManager.createRoom(roomData);
      socket.emit("room:send", code);
    } catch (err) {
      console.error("error when creating room");
      console.error(err);
    }
  });
  
  socket.on('log', (...args) => console.log(...args))
});

//  Boring server stuff
// Swap over non-https connections to https
function checkHttps(request, response, next) {
  // Check the protocol — if http, redirect to https.
  if (request.get("X-Forwarded-Proto").indexOf("https") != -1) {
    return next();
  } else {
    response.redirect("https://" + request.hostname + request.url);
  }
}

app.all("*", checkHttps);

// Express port-switching logic
// no touch
let port;
console.log("❇️ NODE_ENV is", process.env.NODE_ENV);
if (process.env.NODE_ENV === "production") {
  port = process.env.PORT || 3000;

  app.use(express.static(path.join(__dirname, "../build")));
  app.get("*", (request, response) => {
    response.sendFile(path.join(__dirname, "../build", "index.html"));
  });
} else {
  port = 3001;

  console.log("⚠️ Running development server");
}

// Start the listener!
http.listen(port, () => {
  console.log(`❇️ Express server is running on port ${port}`);
});
