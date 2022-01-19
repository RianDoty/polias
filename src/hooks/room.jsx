import { useEffect } from 'react';
import { useSocket } from './socket';
import useSync from './sync';

export default function useRoom(code) {
  const socket = useSocket();
  const [roomState] = useSync(`room state ${code}`, null, true)
  
  useEffect(()=>{
    socket.emit('join room', code);
    return ()=>socket.emit('leave room', code);
  }, [])

  return roomState
}