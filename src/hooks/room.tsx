import { useEffect } from 'react';
import useSync from './sync';

import socket from '../socket'

export default function useRoom(code) {
  const [roomState] = useSync(socket, `room state ${code}`)
  
  useEffect(()=>{
    socket.emit('join room', code);
    return ()=>void socket.emit('leave room', code);
  }, [])

  return roomState
}