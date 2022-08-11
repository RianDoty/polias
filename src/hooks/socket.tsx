import { useMemo } from 'react'
import { Socket } from 'socket.io-client'
import io, { ManagerOptions, SocketOptions } from 'socket.io-client'

export default function useSocket<ListenEvents = undefined,EmitEvents = undefined>(namespace: string, options: Partial<ManagerOptions & SocketOptions> = {}): Socket<ListenEvents,EmitEvents> {
    const socket = useMemo(() => {
        const socket = io(namespace, options)
        console.log(`new socket ${namespace}`)

        socket.on('connect', () => {
            console.log(`socket ${namespace} connected`)
        })

        return socket
    }, [namespace])
    


    return socket
}