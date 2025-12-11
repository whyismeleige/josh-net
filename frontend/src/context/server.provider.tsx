import { createContext, ReactNode, useContext, useState } from "react";
import {
  ChannelData,
  ServerContextType,
  ServerData,
} from "../types/server.types";
import { BACKEND_URL } from "../utils/config";
import { useStudentContext } from "./student.provider";
import { useAppSelector } from "../hooks/redux";

const ServerContext = createContext<ServerContextType | undefined>(undefined);

export function ServerProvider({ children }: { children: ReactNode }) {
  const { accessToken } = useAppSelector((state) => state.auth);

  const [serverData, setServerData] = useState<ServerData[]>([]);
  const [currentServer, setCurrentServer] = useState<ServerData | null>(null);
  const [channelData, setChannelData] = useState<ChannelData[]>([]);
  const [currentChannel, setCurrentChannel] = useState<ChannelData | null>(
    null
  );

  console.log(currentChannel);

  const getChannelData = (serverId: string) => {
    fetch(`${BACKEND_URL}/api/v1/server/channel/list?serverId=${serverId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setChannelData(data.channels);
        setCurrentChannel(data.channels[0]);
      });
  };

  const getServerList = () => {
    fetch(`${BACKEND_URL}/api/v1/server/list`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setServerData(data.servers);
        if (data.servers[0]) {
          setCurrentServer(data.servers[0]);
          getChannelData(data.servers[0]._id);
        }
      });
  };

  const value: ServerContextType = {
    serverData,
    getServerList,
    currentServer,
    setCurrentServer,
    channelData,
    currentChannel,
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
