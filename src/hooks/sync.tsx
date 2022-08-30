import { useState } from "react";
import useSocketCallbacks from "./socket-callbacks";
import type { SyncKeywords, SyncServerEvents } from "../../server/sync";
import useSocket from "./socket";

function JSONClone<O extends object>(obj: O): O {
  return JSON.parse(JSON.stringify(obj));
}

function patch<D extends object>(d: D, diff: Partial<D>) {
  for (const [key, value] of Object.entries(diff)) {
    function hasKey(tbl: {}): tbl is { [index: typeof key]: unknown } {
      return tbl.hasOwnProperty(key);
    }

    //If key is new or the type has changed then assign directly
    if (!hasKey(d) || typeof value !== typeof d[key]) {
      Object.assign(d, { [key]: value });
      continue;
    }

    //If the value is an object then recursively patch
    if (value && typeof value === "object") {
      const dk = d[key];
      if (dk && typeof dk === "object") {
        patch(value, dk);
        continue;
      }
    }

    //If the value is undefined [but the key is] then take that
    //as a signal to delete the value
    if (value === undefined) delete d[key];

    //If all else fails just assign value to key
    Object.assign(d, { [key]: value });
  }
  return d;
}

export type SyncState<k extends keyof SyncKeywords> =
  | [true]
  | [false, SyncKeywords[k], (diff: Partial<SyncKeywords[k]>) => void];
export default function useSync<k extends keyof SyncKeywords>(
  nsp: string = "/",
  keyword: k
): SyncState<k> {
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<SyncKeywords[k]>();
  const socket = useSocket<SyncServerEvents<k>>(
    `${nsp === "/" ? "" : `/${nsp}`}/sync/${keyword}/`
  );

  const onData = (data: SyncKeywords[k]) => {
    setStore(data);
    setLoading(false);
  };

  //Stores are immutable, but it might be a total performance nightmare later
  //idk
  const onDiff = (diff: Partial<SyncKeywords[k]>) =>
    setStore((store: SyncKeywords[k]) => patch(JSONClone(store), diff));

  //Technically a race condition but it's like racing against the flash
  useSocketCallbacks(socket, {
    sync_data: onData,
    sync_diff: onDiff
  });

  return loading ? [true] : [false, store, onDiff];
}
