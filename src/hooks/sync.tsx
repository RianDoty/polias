import { useEffect, useState } from "react";
import useVolatileState from "./volatile-state";
import useSocketCallbacks from "./socket-callbacks";
import useSocket from "../contexts/socket";

const useSync = (
  socket,
  keyword,
  def = {},
  log = false
): [boolean, Object, Function] => {
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useVolatileState(def);

  useEffect(() => {
    socket.emit("sync_subscribe", keyword)
    return () => socket.emit("sync_unsubscribe", keyword);
  }, [keyword]);

  const route =
    (callback) =>
    (kw, ...args) => {
      if (kw === keyword) callback(...args);
    };

  const onData = route((data) => {
    setStore(data)
    setLoading(false)
  })
  
  const onCreate = route((key, value) => {
    setStore((store) => {
      if (log)
        console.log(`${keyword} to create k: ${key.slice(0, 7)} v:`, value);
      store[key] = value;
      return store;
    });
  });

  const onUpdate = route((value, ...props) => {
    setStore((store) => {
      if (log) console.log(`${keyword} to update k: ${props} value: ${value}`);
      const lastProp = props.pop();
      const lastObject = props.reduce((st, prop) => st[prop], store);

      lastObject[lastProp] = value;

      return store;
    });
  });

  const onDelete = route((key) => {
    setStore((store) => {
      if (log) console.log(`${keyword} to delete k: ${key.slice(0, 7)}`);
      delete store[key];
      return store;
    });
  });

  useSocketCallbacks(socket, {
    sync_data: onData,
    sync_create: onCreate,
    sync_update: onUpdate,
    sync_delete: onDelete,
  });

  return [loading, store, setStore];
};

export default useSync;
