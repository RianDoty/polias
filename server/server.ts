import { NextFunction, Request, Response } from "express";
import { ClientRequest, ServerResponse } from "http";
import { Http2ServerRequest, Http2ServerResponse } from "http2";
import { Socket } from "socket.io";

const express = require("express");
const path = require("path");
const app = express();
const http = require("http").Server(app);
const { Server } = require("socket.io");
const io = new Server(http);

const RoomManager = require("./room-manager")(io);

io.on("connection", (socket: Socket & {username: string}) => {
  console.log('connection')
  socket.on('username', (username) => {
    socket.username = username
  })
  
  socket.on("room_create", (roomData) => {
    try {
      console.log("creating a room...");
      if (!socket.username) throw 'Invalid username';
      
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
