import { Socket } from 'socket.io-client'
import { useEffect } from 'react';
import socket from '../socket';

interface SocketReservedEvents {
  connect: () => void;
  connect_error: (err: Error) => void;
  disconnect: (reason: Socket.DisconnectReason) => void;
}

type IndexEither<a,b,key> = key extends keyof a ? a[key] : key extends keyof b ? b[key] : never

export type EventsTable<Events> = {[key in keyof SocketReservedEvents | keyof Events]?: IndexEither<SocketReservedEvents, Events, key>};

//Connects a list of functions to the socket
export default function useSocketCallbacks<Events>(socket: Socket<Events>, callbackData: EventsTable<Events>) {
  useEffect(()=>{
    if (!socket || !callbackData) return;
    
    const callbacks = Object.entries(callbackData);
    
    const iterate = fkey => callbacks.forEach(([key, callback]) => socket[fkey](key, callback))
    const connect = () => iterate('on');
    const disconnect = () => iterate('off');
    
    connect()
    return disconnect;
  },[callbackData])
}