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
  Attachment,
  AttachmentTransferProcess,
  ChannelData,
  MessageData,
  ServerContextType,
  ServerData,
} from "../types/server.types";
import { BACKEND_URL } from "../utils/config";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { io, Socket } from "socket.io-client";
import { useIsMobile } from "@/hooks/use-mobile";
import { addNotification } from "../store/slices/notification.slice";
import { nanoid } from "@reduxjs/toolkit";

const ServerContext = createContext<ServerContextType | undefined>(undefined);

function readFileAsBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

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
  const isMobile = useIsMobile();
  const dispatch = useAppDispatch();

  const socketRef = useRef<Socket | null>(null); // Socket Ref
  const isIntialMount = useRef(true); // Intial Mount
  const pendingMessagesRef = useRef<Map<string, boolean>>(new Map());

  const { accessToken, user } = useAppSelector((state) => state.auth);

  const [messageInput, setMessageInput] = useState<string>("");
  const [serverData, setServerData] = useState<ServerData[]>([]);
  const [currentServer, setCurrentServer] = useState<ServerData | null>(null);
  const [channelData, setChannelData] = useState<ChannelData[]>([]);
  const [currentChannel, setCurrentChannel] = useState<ChannelData | null>(
    null
  );
  const [messages, setMessagesData] = useState<MessageData[]>([]);

  const [leftSidebarState, setLeftSidebarState] = useState<boolean | null>(
    null
  );
  const [rightSidebarState, setRightSidebarState] = useState<boolean | null>(
    null
  );
  const [attachments, setAttachments] = useState<File[]>([]);

  const leftSidebar = leftSidebarState ?? !isMobile;
  const rightSidebar = rightSidebarState ?? !isMobile;

  const updateAttachmentStatus = (
    messageId: string,
    attachmentIndex: number,
    data: {
      transferring?: boolean;
      transferProcess?: AttachmentTransferProcess;
      transferProgress?: number;
    }
  ) => {
    setMessagesData((prevMessages) =>
      prevMessages.map((message) => {
        if (message._id !== messageId) return message;
        return {
          ...message,
          attachments: message.attachments.map((attachment, index) =>
            index === attachmentIndex
              ? {
                  ...attachment,
                  ...data,
                }
              : attachment
          ),
        };
      })
    );
  };

  const setLeftSidebar = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      if (typeof value === "function") {
        setLeftSidebarState((prevOverride) => {
          const currentValue = prevOverride ?? !isMobile;
          return value(currentValue);
        });
      } else {
        setLeftSidebarState(value);
      }
    },
    [isMobile]
  );

  const setRightSidebar = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      if (typeof value === "function") {
        setRightSidebarState((prevOverride) => {
          const currentValue = prevOverride ?? !isMobile;
          return value(currentValue);
        });
      } else {
        setRightSidebarState(value);
      }
    },
    [isMobile]
  );

  const sendFile = async (
    socket: Socket,
    index: number,
    onProgress: (sent: number, total: number) => void,
    onDone: () => void,
    onAborted: () => void
  ) => {
    const CHUNK_SIZE = 256 * 1024;

    const id = nanoid(5);
    const attachment = attachments[index];

    const onNextKey = `${index}:${id}:next`;
    const onAbortKey = `${index}:${id}:abort`;
    const onEndKey = `${index}:${id}:end`;

    const buffer = await readFileAsBuffer(attachment);
    const size = attachment.size;

    let bytesSent = 0;

    const removeAllListeners = () => {
      socket.removeAllListeners(onNextKey);
      socket.removeAllListeners(onAbortKey);
      socket.removeAllListeners(onEndKey);
    };

    const sendNextChunk = () => {
      if (bytesSent < size) {
        const chunkSize = Math.min(CHUNK_SIZE, size - bytesSent);
        socket.emit(index.toString(), {
          id,
          chunk: buffer.slice(bytesSent, bytesSent + chunkSize),
        });
        bytesSent += chunkSize;
        onProgress(bytesSent, size);
      } else {
        socket.emit(index.toString(), {
          id,
          metadata: {
            name: attachment.name,
            type: attachment.type,
            size: attachment.size,
          },
        });
      }
    };

    const abortTransfer = () => {
      removeAllListeners();
      onAborted();
    };

    const endTransfer = () => {
      removeAllListeners();
      onDone();
    };

    socket.on(onNextKey, sendNextChunk);
    socket.on(onAbortKey, abortTransfer);
    socket.on(onEndKey, endTransfer);
    sendNextChunk();
  };

  const sendMessage = useCallback(async () => {
    try {
      if (!user || (messageInput.trim() === "" && attachments.length === 0))
        return;

      const messageData = {
        channelId: currentChannel?._id,
        serverId: currentServer?._id,
        userId: user?._id,
      };

      console.log("The attachments currently are", attachments);

      const newMessageAttachments: Attachment[] = attachments.map(
        (attachment) => ({
          _id: nanoid(5),
          fileName: attachment.name,
          fileSize: attachment.size,
          id: nanoid(5),
          mimeType: attachment.type,
          s3Key: "",
          s3URL: "",
          transferProcess: "upload",
          transferring: true,
        })
      );

      const newMessage: MessageData = {
        _id: nanoid(5),
        content: messageInput.trim(),
        type: "text",
        createdAt: "",
        timestamp: "",
        updatedAt: "",
        deletedAt: "",
        userId: user,
        attachments: newMessageAttachments,
        deleted: "",
      };

      console.log("The New Message is", newMessage);

      pendingMessagesRef.current.set(newMessage._id, true);
      console.log("Refs after adding ", pendingMessagesRef.current);
      setMessagesData((prevMessages) => [...prevMessages, newMessage]);

      if (socketRef.current) {
        const socket = socketRef.current;

        socket.emit(
          "send-message",
          attachments.length,
          messageData,
          messageInput.trim(),
          newMessage._id
        );

        const handleGetFile = async (index: number) => {
          sendFile(
            socket,
            index,
            (sent, total) => {
              const transferProgress = 100 * (sent / total);
              updateAttachmentStatus(newMessage._id, index, {
                transferProgress,
              });
            },
            () => {
              updateAttachmentStatus(newMessage._id, index, {
                transferring: false,
              });
            },
            () => {
              updateAttachmentStatus(newMessage._id, index, {
                transferring: false,
              });
            }
          );
        };

        const handleAllUploadsComplete = () => {
          console.log("All Messages were successful");
          console.log(
            `Is it ${newMessage._id} available`,
            pendingMessagesRef.current.has(newMessage._id)
          );
          pendingMessagesRef.current.set(newMessage._id, false);
          console.log("Refs after setting", pendingMessagesRef.current);
        };

        const handleUploadError = (error: Error) => {
          console.error("Upload Error", error);
          pendingMessagesRef.current.set(newMessage._id, false);
        };

        socket.removeAllListeners("get-file");
        socket.removeAllListeners("all-uploads-complete");
        socket.removeAllListeners("upload-error");

        socket.on("all-uploads-complete", handleAllUploadsComplete);
        socket.on("get-file", handleGetFile);
        socket.on("upload-error", handleUploadError);

        setMessageInput("");
        setAttachments([]);
      } else {
        throw Error("Error in Sending Message, Try Again Later");
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error in Sending Message, Try Again Later";
      dispatch(
        addNotification({
          type: "error",
          title: "Error in Message",
          description: message,
        })
      );
    }
  }, [
    dispatch,
    attachments,
    messageInput,
    currentServer?._id,
    currentChannel?._id,
    socketRef.current,
    user?._id,
    user,
  ]);

  const getMessagesList = useCallback(
    (channelId: string) => {
      // Receive Messages List of the Current Channel
      fetch(
        `${BACKEND_URL}/api/v1/server/message/list?channelId=${channelId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
        .then((response) => response.json())
        .then((data) => setMessagesData(data.messages)); // Save the Message Data
    },
    [accessToken]
  );

  const getChannelList = useCallback(
    (serverId: string) => {
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
    },
    [accessToken]
  );

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

    socket.on("receive-message", (newMessage, tempMsgId) => {
      // Receive Message from Channel Room
      console.log("Received Temp Message ID", tempMsgId);
      console.log("Current Refs", pendingMessagesRef.current);
      console.log("Is it available", pendingMessagesRef.current.has(tempMsgId));

      console.log("The new message received is", newMessage);
      if (
        pendingMessagesRef.current.has(tempMsgId) &&
        !pendingMessagesRef.current.get(tempMsgId)
      ) {
        setMessagesData((prev) =>
          prev.map((prevMessage) =>
            prevMessage._id === tempMsgId ? newMessage : prevMessage
          )
        );
        pendingMessagesRef.current.delete(tempMsgId);
      } else {
        setMessagesData((prev) => [...prev, newMessage]);
      }
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
    setAttachments,
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
