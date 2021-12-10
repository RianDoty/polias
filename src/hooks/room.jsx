import { useEffect } from 'react';
import { useSocket } from './socket';

export default function useRoom(code) {
  const socket = useSocket();
  
  useEffect(()=>{
    socket.emit('join room', code);
    return ()=>socket.emit('leave room', code);
  }, [])
}