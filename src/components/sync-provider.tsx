import React from 'react';
import useSync from '../hooks/sync';
import getSyncContext from '../contexts/sync';

export default function SyncProvider({keyword, context = keyword, children}) {
  const [store] = useSync(keyword);
  const Context = getSyncContext(context);
  
  return (
    <Context.Provider value={store}>
      {children}
    </Context.Provider>
  )
}