import React, { useEffect, useMemo, useState } from "react";
//import io, { ManagerOptions, SocketOptions } from "socket.io-client";

//Game-related stuff
import RoomContext from "../contexts/room";
import CardPackContext from "../contexts/cardPack";

//Game components
import LeftSideBar from "../components/game/left-side-bar";
import MiddleContent from "../components/game/middle-content";
import Console from "../components/game/console/console";
import NameEntryScreen from "../components/game/name-entry-screen";

import type { RouteComponentProps } from "wouter";
import { RoomSocketProvider } from "../contexts/room-socket";
import useSync from "../hooks/sync";
import useSocket from "../hooks/socket";
import ErrorBoundary from "../components/error-boundary";
import { getSyncContext } from "../contexts/sync-context";

import "../styles/game.css";
import useSocketCallbacks from "../hooks/socket-callbacks";
import { SessionProvider } from "../contexts/session";

export default function RoomMain({
  params: { code }
}: RouteComponentProps<{ code: string }>) {
  const socket = useSocket(`/${code}/`, { autoConnect: false });
  const [session, setSession] = useState<{
    sessionId: string;
    userId: string;
  }>({ sessionId: "", userId: "" });

  //The base socket being connected says to the server that the
  //user as a whole is connected to the game.
  useSocketCallbacks(socket, {
    session: (s: { sessionId: string; userId: string }) => setSession(s)
  });

  useEffect(() => {
    socket.auth = { sessionId: localStorage.getItem("session") };
    socket.connect();
  }, [socket]);

  const OptionsContext = getSyncContext("room_options");
  const optionsSync = useSync(code, "room_options");
  const [optionsLoading, options] = optionsSync;

  return (
    <SessionProvider value={session}>
      <OptionsContext.Provider value={optionsSync}>
        <RoomSocketProvider value={socket}>
          <RoomContext.Provider value={code}>
            <CardPackContext.Provider
              value={optionsLoading ? [true] : [false, options.cardPack]}
            >
              <ErrorBoundary>
                <LeftSideBar />
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
    </SessionProvider>
  );
}
