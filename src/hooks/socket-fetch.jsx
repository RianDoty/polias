import { useEffect } from 'react';
import socket from '../socket.js'

export const useSocketFetch = (name, ...data) => { //...data, ack
  const ack = data.pop();
  
  useEffect(()=>{
    socket.emit(name, ...data, ack)
  // eslint-disable-next-line
  },[]); //eslint is not happy about this, but this is defined as only running once!
}