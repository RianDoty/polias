import { useEffect, useState } from "react";
import useVolatileState from "./volatile-state";
import useSocketCallbacks from "./socket-callbacks";
import useSocket from '../contexts/socket';

const useSync = (keyword, def=({}), log=false): [boolean, Object, Function] => {
  const socket = useSocket()
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useVolatileState(def);

  useEffect(() => {
    socket.emit(`sync_subscribe ${keyword}`, s => setStore(def => {
      //Prune out elements that were already defined by the client
      //Prevents 'refreshing' info that the client should know already,
      //because the info is likely sourced from themselves.
      Object.keys(def).forEach(key => {
        delete s[key];
      })

      console.log(`${keyword} recieved:`, s);
      setLoading(false)
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

  return [loading, store, setStore];
};

export default useSync;