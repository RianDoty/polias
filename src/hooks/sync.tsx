import { useState } from "react";
import useSocketCallbacks from "./socket-callbacks";
import type { SyncKeywords, SyncServerEvents } from "../../server/sync";
import useSocket from "./socket";
import useSession from "../contexts/session";

function JSONClone<O extends object>(obj: O): O {
  return JSON.parse(JSON.stringify(obj));
}

function hasKey<K extends string>(
  tbl: {},
  key: K
): tbl is { [index in K]: unknown } {
  return tbl.hasOwnProperty(key);
}

type Diff<T> = { [K in keyof T]?: Diff<T[K]> | unknown };
function patch<D extends object>(data: D, diff: Diff<D>) {
  for (const [key, value] of Object.entries(diff)) {
    if (!hasKey(data, key) || typeof value !== typeof data[key]) {
      Object.assign(data, { [key]: value });
      continue;
    }

    if (value && typeof value === "object") {
      const dataEntry = data[key];
      if (dataEntry && typeof dataEntry === "object") {
        patch(dataEntry, value);
        continue;
      }
    }

    if (value === undefined) delete data[key];

    Object.assign(data, { [key]: value });
  }

  return data;
}

export type SyncState<k extends keyof SyncKeywords> =
  | [true]
  | [false, SyncKeywords[k], (diff: Partial<SyncKeywords[k]>) => void];
export default function useSync<k extends keyof SyncKeywords>(
  nsp: string = "/",
  keyword: k,
  sessionId?: string
): SyncState<k> {
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<SyncKeywords[k]>({} as SyncKeywords[k]);
  const socket = useSocket<SyncServerEvents<k>>(
    `${nsp === "/" ? "" : `/${nsp}`}/sync/${keyword}/`,
    { auth: { sessionId } }
  );

  const onData = (data: SyncKeywords[k]) => {
    setStore(data);
    setLoading(false);
  };

  //Stores are immutable!
  const onDiff = (diff: Diff<SyncKeywords[k]>) =>
    setStore((store) => patch(JSONClone(store) as SyncKeywords[k], diff));

  //Technically a race condition but it's like racing against the flash
  useSocketCallbacks(socket, {
    sync_data: onData,
    sync_diff: onDiff
  });

  return loading ? [true] : [false, store, onDiff];
}

export function usePersonalSync<k extends keyof SyncKeywords>(
  nsp: string,
  keyword: k,
  sessionId?: string
): SyncState<k> {
  return useSync(nsp, keyword, sessionId ?? useSession()?.sessionId);
}
