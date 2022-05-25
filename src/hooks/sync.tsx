import { useEffect, useState } from "react";
import useSocketCallbacks from "./socket-callbacks";
import type {
  ListSyncKeywords,
  SyncClientEvents,
  SyncServerEvents
} from "../../server/sync";
import { Socket } from "socket.io-client";

function JSONClone<O extends object>(obj: O): O {
  return JSON.parse(JSON.stringify(obj));
}

function patch<D extends object>(d: D, diff: Partial<D>) {
  for (const [key, value] of Object.entries(diff)) {
    function hasKey(tbl: {}): tbl is { [index: typeof key]: unknown } {
      return tbl.hasOwnProperty(key);
    }

    if (!hasKey(d) || typeof value !== typeof d[key]) {
      Object.assign(d, { key: value });
      continue;
    }

    if (value && typeof value === "object") {
      const dk = d[key];
      if (dk && typeof dk === "object") {
        patch(value, dk);
        continue;
      }
    }

    if (value === undefined) delete d[key];

    Object.assign(d, { key: value });
  }
  return d;
}

export default function useSync<k extends keyof ListSyncKeywords>(
  socket: Socket<SyncServerEvents, SyncClientEvents>,
  keyword: k,
  def: ListSyncKeywords[k] = {},
  log = false
): [boolean, ListSyncKeywords[k], Function] {
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState(def);

  useEffect(() => {
    setLoading(true);
    socket.emit("sync_subscribe", keyword);
    return () => void socket.emit("sync_unsubscribe", keyword);
  }, [keyword, socket]);

  function route<A extends unknown[]>(callback: (...args: A) => void) {
    return (kw: k, ...args: A) => {
      if (kw === keyword) callback(...args);
    };
  }

  const onData = route((data: ListSyncKeywords[k]) => {
    setStore(data);
    setLoading(false);
  });

  const onDiff = route((diff: Partial<ListSyncKeywords[k]>) => {
    setStore((store: ListSyncKeywords[k]) => patch(JSONClone(store), diff));
  });

  useSocketCallbacks(socket, {
    sync_data: onData,
    sync_diff: onDiff
  });

  return [loading, store, setStore];
}
