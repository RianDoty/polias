import React, { useState, createContext, useContext } from 'react';

const SocketContext = createContext()

export const SocketProvider = ({value, children}) => <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
export default () => useContext(SocketContext)