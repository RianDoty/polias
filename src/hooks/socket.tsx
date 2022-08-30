import { useEffect, useMemo } from "react";
import { Socket } from "socket.io-client";
import io, { ManagerOptions, SocketOptions } from "socket.io-client";

export default function useSocket<ListenEvents = any, EmitEvents = any>(
  namespace: string,
  options: Partial<ManagerOptions & SocketOptions> = {}
): Socket<ListenEvents, EmitEvents> {
  const socket = useMemo(() => {
    const socket = io(namespace, options);
    console.log(`new socket ${namespace}`);

    return socket;
  }, [namespace]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log(`socket ${namespace} connected`);
    });

    socket.on("disconnect", () => {
      console.log(`socket ${namespace} disconnected`);
    });

    return () => void socket.disconnect();
  }, [namespace]);

  return socket;
}
