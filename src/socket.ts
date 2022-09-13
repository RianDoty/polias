import io from "socket.io-client";
import { BaseSocket } from "./socket-types";

const socket: BaseSocket = io();

export default socket;
