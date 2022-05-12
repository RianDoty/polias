import type { NextFunction, Request, Response } from "express";
import type { Server as MyServer, Socket as MySocket } from "./socket-types";
import type { RoomData } from "./room";

import express from "express";
import path from "path";
const app = express();
const http = require("http").Server(app);
import { Server } from 'socket.io'

const io: MyServer = new Server(http);

const RoomManager = require("./room-manager")(io);
 
io.on("connection", (socket: MySocket) => {
  console.log('connection')
  socket.on('username', (username: string) => {
    socket.data.username = username
  })
  
  socket.on("room_create", (roomData: RoomData) => {
    try {
      console.log("creating a room...");
      if (!socket.data.username) throw 'Invalid username';
      
      Object.assign(roomData, {
        host: socket
      })
      
      const { code } = RoomManager.createRoom(roomData);
      socket.emit("room_send", code);
    } catch (err) {
      console.error("error when creating room");
      console.error(err);
    }
  });
  socket.on('log', (...args) => console.log(...args))
});

//  Boring server stuff
// Swap over non-https connections to https
function checkHttps(request:Request, response:Response, next:NextFunction) {
  // Check the protocol — if http, redirect to https.
  const proto = request.get("X-Forwarded-Proto")
  if (proto && proto.indexOf("https") != -1) {
    return next();
  } else {
    response.redirect("https://" + request.hostname + request.url);
  }
}

app.all("*", checkHttps);

// Express port-switching logic
// no touch
let port: string | number;
console.log("❇️ NODE_ENV is", process.env.NODE_ENV);
if (process.env.NODE_ENV === "production") {
  port = process.env.PORT || 3000;

  app.use(express.static(path.join(__dirname, "../build")));
  app.get("*", (request:Request, response:Response) => {
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
