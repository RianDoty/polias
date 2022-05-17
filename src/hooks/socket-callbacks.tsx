import type { Socket } from 'socket.io-client'
import { useEffect } from 'react';
import socket from '../socket'

export type CallbacksTable<Callbacks> = {[key in keyof Callbacks]: (...args: any[]) => void;};

//Connects a list of functions to the socket
export default function useSocketCallbacks<Callbacks>(socket: Socket<Callbacks>, callbackData: CallbacksTable<Callbacks>) {
  
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