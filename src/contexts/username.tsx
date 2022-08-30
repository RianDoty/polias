import React, {
  useState,
  createContext,
  useContext,
  Dispatch,
  SetStateAction
} from "react";

const errOnCall = () => {
  throw Error("Username attempted to be set without provider!");
};
type stringState = [string, Dispatch<SetStateAction<string>>];

const UsernameContext = createContext<stringState>(["", errOnCall]);
export const UsernameProvider = ({ def = "", children }) => (
  <UsernameContext.Provider value={useState(def)}>
    {children}
  </UsernameContext.Provider>
);
export default () => useContext(UsernameContext);
