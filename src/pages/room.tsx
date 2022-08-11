import React, { useRef } from "react";
import io, { ManagerOptions, SocketOptions } from 'socket.io-client'

//Game-related stuff
import RoomContext from "../contexts/room";
import CardPackContext from "../contexts/cardPack";

//Game components
import LeftSideBar from "../components/game/left-side-bar";
import MiddleContent from "../components/game/middle-content";
import Console from "../components/game/console/console";
import NameEntryScreen from "../components/game/name-entry-screen";

//Style
import "../styles/game.css";
import type { RouteComponentProps } from "wouter";
import { RoomSocketProvider } from "../contexts/room-socket";
import useSync from "../hooks/sync";
import useSocket from "../hooks/socket";

export default function RoomMain({ params: { code } }: RouteComponentProps<{ code: string }>) {
  const socket = useSocket(`/${code}/`, {autoConnect: false})  

  const [loading, options] = useSync(`/${code}/`, 'room_options')

  return (
    <RoomSocketProvider value={socket}>
      <RoomContext.Provider value={code}>
        <CardPackContext.Provider value={loading? null : options.cardPack}>
          <LeftSideBar players={{}} />
          <MiddleContent />
          <Console />
          <NameEntryScreen />
        </CardPackContext.Provider>
      </RoomContext.Provider>
    </RoomSocketProvider>
  );
}
