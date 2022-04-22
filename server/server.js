const express = require("express");
const path = require("path");
const app = express();
const http = require("http").Server(app);
const { Server } = require("socket.io");
const io = new Server(http);

const RoomManager = require('./room-manager')(io)

//Room Creation
io.on('connection', socket => {
  socket.on('log', (data) => {
    console.log(data)
  })
  
  socket.on('room:create', (roomData, ackCode) => {
    try {
      console.log('creating a room...')
      ackCode([true, RoomManager.createRoom(roomData).code])
    } catch(err) {
      ackCode([false, 'Error when creating a Room.'])
    }
  })
})

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
