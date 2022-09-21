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
import useUsername from "../contexts/username";

export default function RoomMain({
  params: { code }
}: RouteComponentProps<{ code: string }>) {
  const [exists, setExists] = useState(true); //Tracks if the page exists
  const [username] = useUsername();
  const socket = useSocket(`/${code}/`, { autoConnect: false });
  const [session, setSession] = useState<{
    sessionId: string;
    userId: string;
  }>({ sessionId: localStorage.getItem(`session/${code}`) ?? "", userId: "" });

  //Request the server to see if the game exists or not
  useEffect(() => {
    (async () => {
      const location = window.location.origin;
      const data: { exists: boolean } = await fetch(
        `${location}/api/${code}`
      ).then((res) => res.json());
      setExists(data.exists);
    })();
  }, []);

  //The base socket being connected says to the server that the
  //user as a whole is connected to the game.
  useSocketCallbacks(socket, {
    session: (s: { sessionId: string; userId: string }) => {
      if (s.sessionId !== localStorage.getItem(`session/${code}`)) {
        console.log(`Recieved session! sId: ${s.sessionId}`);
      } else {
        console.log(`Valid session confirmed!`);
      }

      localStorage.setItem(`session/${code}`, s.sessionId);
      setSession(s);
    },

    connect_error: (err: Error) => {
      if (err.message === "Invalid SessionId") {
        //The SessionId given to the server doesn't exist! Reconnect with a new one.
        console.log("Invalid sessionId grabbed, discarding and trying again..");
        socket.auth = {};
        localStorage.setItem(`session/${code}`, null);
        socket.connect();
      }
    }
  });

  useEffect(() => {
    const sessionId = localStorage.getItem(`session/${code}`);
    if (sessionId) {
      console.log(`Session grabbed as ${sessionId}`);
      socket.auth = { sessionId };
    } else {
      if (!username) return;
      socket.auth = { username };
    }
    socket.connect();
  }, [socket, code, username]);

  const OptionsContext = getSyncContext("room_options");
  const optionsSync = useSync(code, "room_options");
  const [optionsLoading, options] = optionsSync;

  if (!exists)
    return <h1>The room you're looking for doesn't seem to exist.</h1>;

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
