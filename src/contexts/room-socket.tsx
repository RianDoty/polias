import React, { createContext, useContext } from "react";
import type { RoomSocket } from "../socket-types";

const RoomSocketContext = createContext<RoomSocket>(null)

export const RoomSocketProvider = ({value, children}) => <RoomSocketContext.Provider value={value}>{children}</RoomSocketContext.Provider>
export default () => useContext(RoomSocketContext)