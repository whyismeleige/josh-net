import { createContext, ReactNode, useContext, useState } from "react";
import { ServerContextType, ServerData } from "../types/server.types";
import { BACKEND_URL } from "../utils/config";
import { useStudentContext } from "./student.provider";
import { useAppSelector } from "../hooks/redux";

const ServerContext = createContext<ServerContextType | undefined>(undefined);

export function ServerProvider({ children }: { children: ReactNode }) {
  const { accessToken } = useAppSelector((state) => state.auth);

  const [serverData, setServerData] = useState<ServerData[]>([]);
  const [currentServer, setCurrentServer] = useState<ServerData | null>(null);
  const [channelData, setChannelData] = useState();
  const [currentChannel, setCurrentChannel] = useState();

  const getChannelData = (channelId: string) => {
    fetch(``)
  }

  const getServerList = () => {
    fetch(`${BACKEND_URL}/api/v1/server/list`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setServerData(data.servers);
        if (data.servers[0]) {
          setCurrentServer(data.servers[0]);
        }
      });
  };

  const value: ServerContextType = {
    serverData,
    getServerList,
    currentServer,
    setCurrentServer,
  };

  return (
    <ServerContext.Provider value={value}>{children}</ServerContext.Provider>
  );
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
