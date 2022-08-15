import type { NextFunction, Request, Response } from "express";
import type { Server as MyServer, Socket as MySocket } from "./socket-types";
import type { RoomData, RoomParameters } from "./room";

import { Server } from "socket.io";
import RoomManager from "./room-manager";
import { randomCode } from "./random-code";
const express = require("express");
const path = require("path");
const app = express();
const http = require("http").Server(app);

const io = new Server(http);
const nsp: MyServer = io.of("/");

const MyRoomManager = new RoomManager(nsp);

//Base server for creating rooms
nsp.on("connection", (socket: MySocket) => {
  //Debug
  console.log("connection");

  socket.onAny((name: string, ...args: any[]) => {
    console.log(`[S] ${name}:`,args);
  });

  socket.on("room_create", function onCreateRoomRequest(
    roomParams: RoomParameters
  ) {
    try {
      console.log("creating a room...");
      if (roomParams === undefined || typeof roomParams !== "object")
        throw Error("Invalid RoomData");
      if (!socket.data.username) throw Error("Invalid username");

      const roomData: RoomData = Object.assign(roomParams, {
        host: socket,
        code: randomCode(4)
      });

      const room = MyRoomManager.createRoom(roomData);
      console.log(room);
      socket.emit("room_send", room.code);
    } catch (err) {
      console.error("error when creating room");
      console.error(err);
    }
  });
});

//  Boring server stuff
// Swap over non-https connections to https
function checkHttps(request: Request, response: Response, next: NextFunction) {
  // Check the protocol — if http, redirect to https.
  const proto = request.get("X-Forwarded-Proto");
  if (proto && proto.indexOf("https") !== -1) {
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
  //When NODE_ENV is production, serve the client-side in a static package
  port = process.env.PORT || 3000;
  app.use(express.static(path.join(__dirname, "../build")));
  app.get("*", (request: Request, response: Response) => {
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
