import { useEffect, useState } from "react";
import useSocketCallbacks from "./socket-callbacks";
import type {
  SyncKeywords,
  SyncServerEvents
} from "../../server/sync";
import { Socket } from "socket.io-client";
import useSocket from "./socket";

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

export default function useSync<k extends keyof SyncKeywords>(nsp: string = '/', keyword: k): [true] | [false, SyncKeywords[k], Function] {
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<SyncKeywords[k]>();
	const socket = useSocket<SyncServerEvents<k>>(`${nsp}sync/${keyword}/`)

  const onData = (data: SyncKeywords[k]) => {
    setStore(data);
    setLoading(false);
  };

  const onDiff = (diff: Partial<SyncKeywords[k]>) => {
    setStore((store: SyncKeywords[k]) => patch(JSONClone(store), diff));
  };

  useSocketCallbacks(socket, {
    sync_data: onData,
    sync_diff: onDiff
  });

  return loading? [true] : [false, store, setStore];
}

