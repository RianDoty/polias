import { createContext, useContext, useState } from "react";

const sessionContext = createContext({
  sessionId: undefined,
  userId: undefined
});

const useSession = () => useContext(sessionContext);
const SessionProvider = sessionContext.Provider;

export default useSession;
export { SessionProvider };
