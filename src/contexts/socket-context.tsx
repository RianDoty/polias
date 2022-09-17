import React, { Context, createContext, ReactNode, useContext } from "react";
import { Socket } from "socket.io-client";

const CONTEXTSTORE = new Map<string, Context<Socket>>();

//Has collisions, shouldn't matter
//because they only really do when you're
//passing args to the server
export default function useSocketContext(namespace: string) {
  const context = CONTEXTSTORE.get(namespace);
  if (!context)
    throw Error(`Context for namespace [${namespace}] never initialized!`);
  const socket = useContext(context);
  if (!(socket instanceof Socket))
    throw Error(`Context for namespace [${namespace}] never initialized!`);
  return socket;
}

export function SocketProvider({
  nsp,
  socket,
  children
}: {
  nsp: string;
  socket: Socket;
  children: ReactNode;
}) {
  if (!CONTEXTSTORE.has(nsp))
    CONTEXTSTORE.set(nsp, createContext<Socket | undefined>(undefined));
  const SyncContext = CONTEXTSTORE.get(nsp);

  SyncContext.displayName = `${nsp} SocketContext`;
  return <SyncContext.Provider value={socket}>{children}</SyncContext.Provider>;
}
