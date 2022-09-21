import type { NextFunction, Request, Response } from "express";
import type { RoomData, RoomParameters } from "./room";
import { Server } from "socket.io";
import RoomManager from "./room-manager";
import { randomCode } from "./random-code";
import debugNSP from "./nspdebug";
import express from "express";
const path = require("path");
const app = express();
const http = require("http").Server(app);

const io = new Server(http);
const nsp = io.of("/");

const MyRoomManager = new RoomManager(nsp);

debugNSP(nsp);

//Base server for creating rooms
nsp.on("connection", (socket) => {
  socket.on("room_create", function onCreateRoomRequest(
    roomParams: RoomParameters
  ) {
    try {
      console.log("creating a room...");
      if (roomParams === undefined || typeof roomParams !== "object")
        throw Error("Invalid RoomData");

      const roomData: RoomData = Object.assign(roomParams, {
        code: randomCode(4)
      });

      const room = MyRoomManager.createRoom(roomData);
      socket.emit("room_send", room.code);
    } catch (err) {
      console.error("error when creating room");
      console.error(err);
    }
  });
});

app.get("/api/:roomId", (req, res) => {
  console.log("Request recieved!");
  res.send({ exists: MyRoomManager.roomExists(req.params.roomId) });
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
  app.get("*", (_: any, response: Response) => {
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
