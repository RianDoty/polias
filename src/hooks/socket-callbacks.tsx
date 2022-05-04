import { useEffect } from 'react';
import useSocket from '../contexts/socket'

//Connects a list of functions to the socket
//Functions in {eventName: func} format
export default (callbackData) => {
  const socket = useSocket()
  
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