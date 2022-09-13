import React, { createContext, useContext } from "react";
import type { RoomSocket } from "../socket-types";

const RoomSocketContext = createContext<RoomSocket>(null)

export const RoomSocketProvider = RoomSocketContext.Provider
export default () => useContext(RoomSocketContext)