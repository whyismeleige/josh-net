import { createContext, ReactNode, useContext, useState } from "react";
import { ServerContextType } from "../types/server.types";

const ServerContext = createContext<ServerContextType | undefined>(undefined);

export function ServerProvider({children}: {children: ReactNode}) {
    const [serverData, setServerData] = useState();

    const value: ServerContextType = {

        
    };

    return <ServerContext.Provider value={value}>{children}</ServerContext.Provider>
}

export function useServerContext() {
  const context = useContext(ServerContext);

  if (!context) {
    throw new Error(
      "Use Server Context should be used within a Server Provider"
    );
  }

  return context;
}
