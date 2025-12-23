import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ChannelData,
  MessageData,
  ServerContextType,
  ServerData,
} from "../types/server.types";
import { BACKEND_URL } from "../utils/config";
import { useAppSelector } from "../hooks/redux";
import { io, Socket } from "socket.io-client";

const ServerContext = createContext<ServerContextType | undefined>(undefined);

/**
 *  This is the Flow of Changes Occuring in the Server Page ( Intial Mount )
 *  1 - getServerList() - Receive The Servers Data of the User
 *  2 - setServerData() - Save the Data received
 *  3 - setCurrentServer() - Save The First Server from the List as the default current Server which will Trigger a useEffect
 *  4 - getChannelList() - Receive The Channels List of The Server
 *  5 - setChannelData() - Save the Data received
 *  6 - setCurrentChannel() - Save The First Channel from The List as the default current Channel which will Trigger a useEffect
 *  7 - joinChannel - Join the Designated Room of the Channel via Sockets
 *  8 - getMessagesList() - Receive the Messages List of The Channels
 *  9 - setMessagesData() - Save the Data received
 */

export function ServerProvider({ children }: { children: ReactNode }) {
  const { accessToken, user } = useAppSelector((state) => state.auth);

  const socketRef = useRef<Socket | null>(null); // Socket Ref
  const isIntialMount = useRef(true); // Intial Mount

  const [messageInput, setMessageInput] = useState<string>("");
  const [serverData, setServerData] = useState<ServerData[]>([]);
  const [currentServer, setCurrentServer] = useState<ServerData | null>(null);
  const [channelData, setChannelData] = useState<ChannelData[]>([]);
  const [currentChannel, setCurrentChannel] = useState<ChannelData | null>(
    null
  );
  const [messages, setMessagesData] = useState<MessageData[]>([]);
  const [leftSidebar, setLeftSidebar] = useState(true);
  const [rightSidebar, setRightSidebar] = useState(true);

  const sendMessage = useCallback(() => {
    // Send Message Logic
    if (messageInput.trim() === "") return;

    if (socketRef.current) {
      socketRef.current.emit(
        "send-message",
        currentChannel?._id,
        user?._id,
        messageInput.trim()
      );
      setMessageInput("");
    }
  }, [messageInput, currentChannel?._id, user?._id]);

  const getMessagesList = useCallback((channelId: string) => {
    // Receive Messages List of the Current Channel
    fetch(`${BACKEND_URL}/api/v1/server/message/list?channelId=${channelId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setMessagesData(data.messages)); // Save the Message Data
  }, [accessToken]);

  const getChannelList = useCallback((serverId: string) => {
    // Receive Channels List of the Current Server
    fetch(`${BACKEND_URL}/api/v1/server/channel/list?serverId=${serverId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setChannelData(data.channels); // Save Channel List
        if (data.channels[0]) {
          setCurrentChannel(data.channels[0]); // Save Current Channel ( triggers UseEffect )
        }
      });
  }, [accessToken]);

  const changeServers = useCallback((server: ServerData) => {
    // Change Servers Logic
    setCurrentServer((prev) => {
      if (prev && prev._id === server._id) return prev;
      console.log("Changing The Server", server._id);
      return server;
    });
  }, []);

  const getServerList = useCallback(() => {
    // Receive Server List of the User
    fetch(`${BACKEND_URL}/api/v1/server/list`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setServerData(data.servers); // Save Server List
        if (data.servers[0]) changeServers(data.servers[0]); // Change Current Server ( triggers UseEffect )
      });
  }, [accessToken, changeServers]);

  const changeChannels = useCallback((channel: ChannelData) => {
    // Change Channels Logic
    setCurrentChannel((prev) => {
      if (prev && prev._id === channel._id) return prev;
      console.log("Changing the Channel", channel._id);
      return channel;
    });
  }, []);

  useEffect(() => {
    if (!socketRef.current) {
      // Socket intialization
      socketRef.current = io(BACKEND_URL, {
        transports: ["websocket", "polling"],
        autoConnect: true,
      });
    }

    const socket = socketRef.current;

    socket.on("connect", () => {}); // Socket Connected to Server

    socket.on("receive-message", (message) => {
      // Receive Message from Channel Room
      setMessagesData((prev) => [...prev, message]);
    });

    socket.on("error", (error) => {
      // Errors in the Socket Flow, in development (console.log), in prod, notification will be used
      console.error("Socket error", error);
    });

    return () => {
      if (socketRef.current) {
        // Unmounting Component will Disconnect the Socket
        console.log("Unmounting: Disconnecting Socket");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isIntialMount.current) {
      // Intial Mount
      isIntialMount.current = false;
      getServerList(); // Get The Server List of the user
    }
  }, [getServerList]);

  useEffect(() => {
    if (!currentChannel || !socketRef.current) return;

    console.log("Joining Channel:", currentChannel._id); // Join the Channel
    socketRef.current.emit("join-channel", currentChannel._id, user?._id);
    getMessagesList(currentChannel._id);

    return () => {
      if (socketRef.current) {
        // Cleanup Function will Disconnect the Room which was joined
        console.log("Leaving Channel", currentChannel._id);
        socketRef.current.emit("leave-channel", currentChannel._id, user?._id);
      }
    };
  }, [currentChannel, currentChannel?._id, user?._id, getMessagesList]);

  useEffect(() => {
    // UseEffect when Current Server Changes
    if (!currentServer) return;

    getChannelList(currentServer._id); // Get the Channel List of the Current Server
  }, [currentServer, currentServer?._id, getChannelList]);

  const value: ServerContextType = {
    serverData,
    getServerList,
    currentServer,
    channelData,
    currentChannel,
    changeServers,
    changeChannels,
    messageInput,
    setMessageInput,
    sendMessage,
    messages,
    leftSidebar,
    setLeftSidebar,
    rightSidebar,
    setRightSidebar,
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