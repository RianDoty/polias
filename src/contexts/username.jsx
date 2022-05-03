import React, { useState, createContext, useContext} from 'react';

const UsernameContext = createContext()

export const UsernameProvider = ({value='', children}) => <UsernameContext.Provider value={useState(value)}>{children}</UsernameContext.Provider>
export default () => useContext(UsernameContext)