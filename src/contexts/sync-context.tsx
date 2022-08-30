import { Context, createContext, ReactNode } from "react";
import { SyncKeywords } from "../../server/sync";
import useSync, { SyncState } from "../hooks/sync";

type AnySyncState = SyncState<any>;
const CONTEXTSTORE = new Map<string, Context<AnySyncState>>();

//Has collisions, shouldn't matter
//because they only really do when you're
//passing args to the server
export function getSyncContext(keyword: keyof SyncKeywords) {
  if (CONTEXTSTORE.has(keyword)) return CONTEXTSTORE.get(keyword);
  CONTEXTSTORE.set(keyword, createContext([true]));
  return CONTEXTSTORE.get(keyword);
}

export function SyncProvider<k extends keyof SyncKeywords>({
  nsp,
  keyword,
  children
}: {
  nsp: string;
  keyword: k;
  children: ReactNode;
}) {
  const SyncContext = getSyncContext(keyword);
  SyncContext.displayName = `${nsp}/${keyword} SyncContext`;

  return (
    <SyncContext.Provider value={useSync(nsp, keyword)}>
      {children}
    </SyncContext.Provider>
  );
}
