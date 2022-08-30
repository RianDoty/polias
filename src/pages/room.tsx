import React, { useMemo, useState } from "react";
//import io, { ManagerOptions, SocketOptions } from "socket.io-client";

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
import ErrorBoundary from "../components/error-boundary";
import { getSyncContext } from "../contexts/sync-context";

export default function RoomMain({
  params: { code }
}: RouteComponentProps<{ code: string }>) {
  const socket = useSocket(`/${code}/`, { autoConnect: false });
  const session = useState(localStorage.getItem(code));
  const OptionsContext = useMemo(() => getSyncContext(code, "room_options"), [
    code
  ]);

  const optionsSync = useSync(code, "room_options");
  const [optionsLoading, options] = optionsSync;

  return (
    <OptionsContext.Provider value={optionsSync}>
      <RoomSocketProvider value={socket}>
        <RoomContext.Provider value={code}>
          <CardPackContext.Provider
            value={optionsLoading ? [true] : [false, options.cardPack]}
          >
            <ErrorBoundary>
              <LeftSideBar players={{}} />
            </ErrorBoundary>
            <ErrorBoundary>
              <MiddleContent />
            </ErrorBoundary>
            <ErrorBoundary>
              <Console />
            </ErrorBoundary>
            <ErrorBoundary>
              <NameEntryScreen />
            </ErrorBoundary>
          </CardPackContext.Provider>
        </RoomContext.Provider>
      </RoomSocketProvider>
    </OptionsContext.Provider>
  );
}
