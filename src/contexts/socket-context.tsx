import { Context, createContext, ReactNode } from "react";
import { Socket } from "socket.io-client";
import { ManagerOptions, SocketOptions } from "socket.io-client";
import useSocket from "../hooks/socket";

const CONTEXTSTORE = new Map<string, Context<Socket>>();

//Has collisions, shouldn't matter
//because they only really do when you're
//passing args to the server
export function getSocketContext(namespace: string) {
  if (CONTEXTSTORE.has(namespace)) return CONTEXTSTORE.get(namespace);
  throw Error(
    `Socket Context ${namespace} is requested, but has never been initialized.`
  );
}

export function SocketProvider({
  nsp,
  options,
  children
}: {
  nsp: string;
  options: Partial<ManagerOptions & SocketOptions>;
  children: ReactNode;
}) {
  const socket = useSocket(nsp, options);

  if (!CONTEXTSTORE.has(nsp)) CONTEXTSTORE.set(nsp, createContext(socket));

  const SyncContext = getSocketContext(nsp);
  SyncContext.displayName = `${nsp} SocketContext`;

  return <SyncContext.Provider value={socket}>{children}</SyncContext.Provider>;
}
