import { useEffect, useMemo } from "react";
import { Socket } from "socket.io-client";
import io, { ManagerOptions, SocketOptions } from "socket.io-client";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export default function useSocket<
  ListenEvents = DefaultEventsMap,
  EmitEvents = DefaultEventsMap
>(
  namespace: string,
  options: Partial<ManagerOptions & SocketOptions> = {}
): Socket<ListenEvents, EmitEvents> {
  const optionsString = JSON.stringify(options);
  const socket = useMemo(() => {
    const socket = io(namespace, options);
    console.log(`new socket ${namespace}`);

    return socket;
  }, [namespace, optionsString]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log(`[${namespace}] connected`);
    });

    socket.on("disconnect", () => {
      console.log(`[${namespace}] disconnected`);
    });

    return () => {
      console.log(`[${namespace}] unmounted`);
      socket.disconnect();
    };
  }, [namespace]);

  return socket;
}
