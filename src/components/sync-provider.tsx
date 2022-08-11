import React from 'react';
import useSync from '../hooks/sync';
import getSyncContext from '../contexts/sync';

export default function SyncProvider({namespace, keyword, context = keyword, children}) {
  const [store] = useSync(namespace, keyword);
  const Context = getSyncContext(context);
  
  return (
    <Context.Provider value={store}>
      {children}
    </Context.Provider>
  )
}