import React from 'react'
import { useState, useEffect } from 'react'

import socket from './socket'

export default () => {
  const [session, setSession] = useState('')
  
  useEffect(()=>{
    socket.on('session', (session) => {
      setSession(JSON.stringify(session))
    })
  },[])
  
  useEffect(()=>{
    socket.auth = { username: 'hehehaha' }
    if (!socket.connected) socket.connect()
  },[])
  
  return (
    <div>
      {session}
    </div>
  )
}