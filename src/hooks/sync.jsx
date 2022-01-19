import { useEffect } from "react";
import useVolatileState from "./volatile-state";
import { useSocket, useSocketCallbacks } from "./socket";

function tablesEqual(t1, t2) {

}

const useSync = (keyword, def={}, log=false) => {
  const socket = useSocket();
  const [store, setStore] = useVolatileState(def);

  useEffect(() => {
    socket.emit(`sync subscribe ${keyword}`, s => setStore(def => {
      //Prune out elements that were already defined by the client
      //Prevents 'refreshing' info that the client should know already,
      //because the info is likely sourced from themself.
      Object.keys(def).forEach(key => {
        delete s[key];
      })

      console.log(`${keyword} recieved:`, s);
      return s;
    }));
    return () => socket.emit(`sync unsubscribe ${keyword}`);
  }, [keyword]);

  useSocketCallbacks({
    [`sync create ${keyword}`]: (key, value) => {
      setStore(store => {
        if (log) console.log(`${keyword} to create k: ${key.substring(0,7)} v:`,value)
        store[key] = value;
        return store;
      });
    },
    [`sync update ${keyword}`]: (key, prop, value) => {
      console.log('sync recieved:',key,prop,value)
      setStore(store => {
        if (value === undefined) {
          //depth 1 update
          value = prop;
          
          if (store[key] === value) return store;
          if (log) console.log(`${keyword} to update k: ${key.substring(0,7)} v: ${value}`)
          store[key] = value;
          return store
        }

        //depth 2 update
        if (!store[key]) return store;
        if (store[key][prop] === value) return store;
        if (log) console.log(`${keyword} to update k: ${key.substring(0,7)} p: ${prop} v: ${value}`)
        store[key][prop] = value
        
        if (log) console.log('new state:', store)
        return store
      })
    },
    [`sync delete ${keyword}`]: key => {
      setStore(store => {
        if (log) console.log(`${keyword} to delete k: ${key.substring(0,7)}`)
        delete store[key];
        return store;
      })
    }
  });

  return [store, setStore];
};

export default useSync;