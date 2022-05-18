import { Socket } from 'socket.io-client'
import { useEffect } from 'react';
import socket from '../socket'
import { SocketReservedEventsMap } from 'socket.io/dist/socket';
import { ReservedOrUserEventNames, ReservedOrUserListener } from 'socket.io/dist/typed-events';


export type EventsTable<Events> = {[key in ReservedOrUserEventNames<SocketReservedEventsMap, Events>]?: ReservedOrUserListener<SocketReservedEventsMap, Events, key>};

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