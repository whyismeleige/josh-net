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
  Friend,
  FriendRequests,
  FriendsState,
  MessageData,
  ServerContextType,
  ServerData,
  ServerType,
  ViewMode,
} from "../types/server.types";
import { BACKEND_URL } from "../utils/config";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { io, Socket } from "socket.io-client";
import { useIsMobile } from "@/hooks/use-mobile";
import { addNotification } from "../store/slices/notification.slice";
import { nanoid } from "@reduxjs/toolkit";
import { EmojiClickData } from "emoji-picker-react";

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
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { accessToken, user } = useAppSelector((state) => state.auth);

  const [view, setView] = useState<ViewMode>("friends");
  const [replyMessage, setReplyMessage] = useState<MessageData | null>(null);
  const [friendsView, setFriendsView] = useState<FriendsState>("all");
  const [messageInput, setMessageInput] = useState<string>("");
  const [typingStatus, setTypingStatus] = useState<string>("");
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
  const [friendsList, setFriendsList] = useState<Friend[]>([]);
  const [currentDM, setCurrentDM] = useState<Friend | null>(null);
  const [friendRequests, setFriendRequests] = useState<FriendRequests[]>([]);

  const leftSidebar = leftSidebarState ?? !isMobile;
  const rightSidebar = rightSidebarState ?? !isMobile;

  const checkMessageInTransit = (messageId: string): boolean =>
    pendingMessagesRef.current.has(messageId);

  const changeMessage = (message: string) => {
    setMessageInput(message);
    if (socketRef.current) {
      socketRef.current.emit(
        "typing",
        currentChannel?._id,
        user?._id,
        user?.name
      );
    }
  };

  const createNewServer = async (
    icon: File | null,
    serverData: { name: string; description?: string; serverType: ServerType }
  ) => {
    try {
      const formData = new FormData();
      if (icon) formData.append("icon", icon);
      formData.append("data", JSON.stringify(serverData));

      const response = await fetch(`${BACKEND_URL}/api/v1/server/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.type !== "success") throw new Error(data.message);

      dispatch(
        addNotification({
          type: "success",
          title: "Successfully Created New Server",
          description: data.message,
        })
      );

      setServerData((prevServers) => [...prevServers, data.newServer]);
      setCurrentServer(data.newServer);
    } catch (error) {
      console.error("Error in Creating New Server");
      const message =
        error instanceof Error
          ? error.message
          : "Server Error, Try Again Later";

      dispatch(
        addNotification({
          title: "Error in Creating New Server",
          description: message,
          type: "error",
        })
      );
    }
  };

  const joinServerViaInvite = async (inviteCode: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/server/join/invite`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inviteCode }),
      });

      const data = await response.json();

      console.log(data);

      if (data.type !== "success") throw new Error(data.message);

      setServerData((prevServers) => [...prevServers, data.server]);

      dispatch(
        addNotification({
          title: "Joined Server Successfully",
          type: data.type,
          description: data.message,
        })
      );
    } catch (error) {
      console.error("Error in Creating New Server");
      const message =
        error instanceof Error
          ? error.message
          : "Server Error, Try Again Later";

      dispatch(
        addNotification({
          title: "Error in Creating New Server",
          description: message,
          type: "error",
        })
      );
    }
  };

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
    key: string,
    attachment: File,
    onProgress: (sent: number, total: number) => void,
    onDone: () => void,
    onAborted: () => void
  ) => {
    const CHUNK_SIZE = 256 * 1024;

    const id = nanoid(5);

    const onNextKey = `${key}:${id}:next`;
    const onAbortKey = `${key}:${id}:abort`;
    const onEndKey = `${key}:${id}:end`;

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
        socket.emit(key, {
          id,
          chunk: buffer.slice(bytesSent, bytesSent + chunkSize),
        });
        bytesSent += chunkSize;
        onProgress(bytesSent, size);
      } else {
        socket.emit(key, {
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
      const currentAttachments = [...attachments];
      const message = messageInput.trim();

      setMessageInput("");
      setAttachments([]);

      if (!user || (message === "" && currentAttachments.length === 0)) return;

      const messageData = {
        channelId: currentChannel?._id,
        serverId: currentServer?._id,
        userId: user?._id,
      };

      const newMessageAttachments: Attachment[] = currentAttachments.map(
        (attachment) => ({
          _id: nanoid(5),
          fileName: attachment.name,
          fileSize: attachment.size,
          id: nanoid(5),
          mimeType: attachment.type,
          s3Key: "",
          s3URL: "",
          cdnURL: "",
          transferProcess: "upload",
          transferring: true,
        })
      );

      const newMessage: MessageData = {
        _id: nanoid(5),
        content: message,
        type: "text",
        replyTo: replyMessage || null,
        forwardedMessage: null,
        isEdited: false,
        createdAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reactions: [],
        deletedAt: "",
        userId: user,
        attachments: newMessageAttachments,
        deleted: "",
      };

      pendingMessagesRef.current.set(newMessage._id, true);
      setMessagesData((prevMessages) => [...prevMessages, newMessage]);

      if (socketRef.current) {
        const socket = socketRef.current;

        socket.emit(
          `send-message`,
          currentAttachments.length,
          messageData,
          message,
          replyMessage?._id,
          newMessage._id
        );

        const handleGetFile = async (index: number) => {
          const key = `${index}:${newMessage._id}`;
          sendFile(
            socket,
            key,
            currentAttachments[index],
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
          pendingMessagesRef.current.set(newMessage._id, false);
        };

        const handleUploadError = () => {
          pendingMessagesRef.current.set(newMessage._id, false);
        };

        socket.removeAllListeners(`get-file:${newMessage._id}`);
        socket.removeAllListeners(`all-uploads-complete:${newMessage._id}`);
        socket.removeAllListeners(`upload-error:${newMessage._id}`);

        socket.on(
          `all-uploads-complete:${newMessage._id}`,
          handleAllUploadsComplete
        );
        socket.on(`get-file:${newMessage._id}`, handleGetFile);
        socket.on(`upload-error:${newMessage._id}`, handleUploadError);
      } else {
        throw Error("Error in Sending Message, Try Again Later");
      }
      setReplyMessage(null);
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
    replyMessage,
    user?._id,
    user,
  ]);

  const toggleReactions = async (
    messageId: string,
    emojiObject: EmojiClickData
  ) => {
    if (socketRef.current) {
      socketRef.current.emit(
        "toggle-reaction",
        currentChannel?._id,
        messageId,
        user?._id,
        emojiObject.emoji
      );
    }
  };

  const changeServers = useCallback((server: ServerData) => {
    // Change Servers Logic
    setCurrentServer((prev) => {
      if (prev && prev._id === server._id) return prev;
      console.log("Changing The Server", server._id);
      return server;
    });
  }, []);

  const changeChannels = useCallback((channel: ChannelData) => {
    // Change Channels Logic
    setCurrentChannel((prev) => {
      if (prev && prev._id === channel._id) return prev;
      console.log("Changing the Channel", channel._id);
      return channel;
    });
  }, []);

  const getMessagesList = useCallback(
    async (channelId: string) => {
      try {
        setMessagesData([]);
        // Receive Messages List of the Current Channel
        const response = await fetch(
          `${BACKEND_URL}/api/v1/server/message/list?channelId=${channelId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const data = await response.json();
        if (data.type !== "success") throw new Error(data.message);

        setMessagesData(data.messages);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Error in Retrieving Messages, Try Again Later";
        dispatch(
          addNotification({
            type: "error",
            title: "Error in Retrieving Message",
            description: message,
          })
        );
      }
    },
    [accessToken, dispatch]
  );

  const getChannelList = useCallback(
    async (serverId: string) => {
      // Receive Channels List of the Current Server
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/v1/server/channel/list?serverId=${serverId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const data = await response.json();

        setChannelData(data.channels); // Save Channel List
        if (data.channels[0]) {
          setCurrentChannel(data.channels[0]); // Save Current Channel ( triggers UseEffect )
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Error in Retrieving Messages, Try Again Later";
        dispatch(
          addNotification({
            type: "error",
            title: "Error in Retrieving Message",
            description: message,
          })
        );
      }
    },
    [accessToken, dispatch]
  );

  const getServerList = useCallback(async () => {
    // Receive Server List of the User
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/server/list`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      setServerData(data.servers); // Save Server List
      if (data.servers[0] && isIntialMount.current)
        changeServers(data.servers[0]); // Change Current Server ( triggers UseEffect )
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error in Retrieving Messages, Try Again Later";
      dispatch(
        addNotification({
          type: "error",
          title: "Error in Retrieving Message",
          description: message,
        })
      );
    }
  }, [accessToken, changeServers, dispatch]);

  const getFriendsList = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/inbox/friends`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (data.type !== "success") {
        throw new Error(data.message);
      }

      setFriendsList(data.friends);
      setFriendRequests(data.requests);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error in Sending Message, Try Again Later";
      dispatch(
        addNotification({
          type: "error",
          title: "Error in Sending Message Message",
          description: message,
        })
      );
    }
  }, [dispatch, accessToken]);

  const sendFriendRequest = async (receiverId: string) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/v1/inbox/friends/request`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ receiverId }),
        }
      );
      const data = await response.json();

      if (data.type !== "success") {
        throw new Error(data.message);
      }

      setFriendRequests((prev) => [...prev, data.outgoingRequest]);
    } catch (error) {
      console.error("Error in Sending Friend Request");
      const message =
        error instanceof Error
          ? error.message
          : "Error in Sending friend request, Try Again Later";
      dispatch(
        addNotification({
          type: "error",
          title: "Error in Sending Friend Request",
          description: message,
        })
      );
    }
  };

  const acceptFriendRequest = async (userId: string) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/v1/inbox/friends/request/accept`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        }
      );

      const data = await response.json();

      if (data.type !== "success") {
        throw new Error(data.message);
      }

      setFriendsList((prev) => [...prev, data.newFriend]);
      setFriendRequests((prev) =>
        prev.filter((request) => request.user._id !== userId)
      );

      dispatch(
        addNotification({
          type: "info",
          title: `${data.newFriend.user.name} is your new friend`,
          description: "You have a new friend",
        })
      );
    } catch (error) {
      console.error("Error in Accepting Friend Request");
      const message =
        error instanceof Error
          ? error.message
          : "Error in Accepting Friend Request, Try Again Later";
      dispatch(
        addNotification({
          type: "error",
          title: "Error in Accepting Friend Request",
          description: message,
        })
      );
    }
  };

  const rejectFriendRequest = async (userId: string) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/v1/inbox/friends/request/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        }
      );

      const data = await response.json();

      if (data.type !== "success") {
        throw new Error(data.message);
      }

      setFriendRequests((prev) =>
        prev.filter((request) => request.user._id !== userId)
      );
    } catch (error) {
      console.error("Error in Rejecting Friend Request");
      const message =
        error instanceof Error
          ? error.message
          : "Error in Rejecting Friend Request, Try Again Later";
      dispatch(
        addNotification({
          type: "error",
          title: "Error in Rejecting Friend Request",
          description: message,
        })
      );
    }
  };

  const cancelFriendRequest = async (userId: string) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/v1/inbox/friends/request/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        }
      );

      const data = await response.json();

      if (data.type !== "success") {
        throw new Error(data.message);
      }

      setFriendRequests((prev) =>
        prev.filter((request) => request.user._id !== userId)
      );
    } catch (error) {
      console.error("Error in Cancelling Friend Request");
      const message =
        error instanceof Error
          ? error.message
          : "Error in Cancelling Friend Request, Try Again Later";
      dispatch(
        addNotification({
          type: "error",
          title: "Error in Cancelling Friend Request",
          description: message,
        })
      );
    }
  };

  const changeDM = (dm: Friend) => {
    setView("inbox");
    setCurrentDM(dm);
    setCurrentChannel(dm.channel);
  };

  const updateReaction = (
    messageId: string,
    userId: string,
    emoji: string,
    newCount: number,
    timestamp: string
  ) => {
    setMessagesData((prevMessages) =>
      prevMessages.map((message) => {
        if (message._id !== messageId) return message;
        if (newCount === 0) {
          return {
            ...message,
            reactions: message.reactions.filter(
              (reaction) => reaction.emoji !== emoji
            ),
          };
        }
        if (newCount === 1)
          return {
            ...message,
            reactions: [
              ...message.reactions,
              {
                emoji,
                users: [
                  {
                    user: userId,
                    timestamp,
                  },
                ],
                count: newCount,
              },
            ],
          };

        const reactions = message.reactions.map((reaction) => {
          if (reaction.emoji !== emoji) return reaction;
          const userExists = reaction.users.find((doc) => doc.user === userId);
          const users = userExists
            ? reaction.users.filter((doc) => doc.user !== userId)
            : [...reaction.users, { user: userId, timestamp }];

          return { ...reaction, users, count: newCount };
        });

        return { ...message, reactions };
      })
    );
  };

  useEffect(() => {
    if (!socketRef.current) {
      // Socket intialization
      socketRef.current = io(BACKEND_URL, {
        transports: ["websocket", "polling"],
        autoConnect: true,
      });
    }

    const socket = socketRef.current;

    socket.on("connect", () => {
      // Socket connecting to Server
      console.log("Connecting to Socket");
    });

    socket.emit("register-user", user?._id);

    socket.on("friend-request-received", (incomingRequest: FriendRequests) => {
      setFriendRequests((prev) => [...prev, incomingRequest]);
      dispatch(
        addNotification({
          type: "info",
          title: `${incomingRequest.user.name} sent you a friend request`,
          description: "You received a friend request!!!",
        })
      );
    });

    socket.on("reaction-updated", updateReaction);

    socket.on("request-accepted", (newFriend: Friend) => {
      setFriendsList((prev) => [...prev, newFriend]);
      setFriendRequests((prev) =>
        prev.filter((request) => request.user._id !== newFriend.user._id)
      );
      dispatch(
        addNotification({
          type: "info",
          title: `${newFriend.user.name} accepted your request`,
          description: "You have a new friend",
        })
      );
    });

    socket.on("new-member-joined", (serverId, newUser) => {
      console.log("New Member Joined", newUser);
      setServerData((prevServers) =>
        prevServers.map((server) =>
          server._id === serverId
            ? { ...server, users: [...server.users, newUser] }
            : server
        )
      );
      if (currentServer && currentServer._id === serverId)
        setCurrentServer((prev) => {
          return prev
            ? {
                ...prev,
                users: [prev.users, newUser],
              }
            : null;
        });
    });

    socket.on("message-edited", (messageId: string, editedContent: string) => {
      console.log("New Edited Content", editedContent);
      setMessagesData((prevMessages) =>
        prevMessages.map((message) =>
          message._id === messageId
            ? { ...message, content: editedContent }
            : message
        )
      );
    });

    socket.on("message-deleted", (messageId: string) => {
      console.log("Message Deleted", messageId);
      setMessagesData((prevMessages) =>
        prevMessages.filter((message) => message._id !== messageId)
      );
    });

    socket.on("request-rejected", (userId: string) => {
      setFriendRequests((prev) =>
        prev.filter((request) => request.user._id !== userId)
      );
    });

    socket.on("request-cancelled", (userId: string) => {
      setFriendRequests((prev) =>
        prev.filter((request) => request.user._id !== userId)
      );
    });

    socket.on("receive-message", (newMessage, tempMsgId) => {
      // Receive Message from Channel Room
      console.log("Forwarded Message is", newMessage);
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
        console.log("Adding new message");
        setMessagesData((prev) => [...prev, newMessage]);
      }
    });

    socket.on("typing-indicator", (message) => {
      setTypingStatus(message);

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        setTypingStatus("");
      }, 2000);
    });

    socket.on("error", (error) => {
      // Errors in the Socket Flow, in development (console.log), in prod, notification will be used
      console.error("Socket error", error);
    });

    return () => {
      if (socketRef.current) {
        // Unmounting Component will Disconnect the Socket
        console.log("Unmounting: Disconnecting Socket");
        socketRef.current.emit("deregister-user", user?._id);
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [currentServer, dispatch, user?._id]);

  useEffect(() => {
    if (isIntialMount.current) {
      // Intial Mount
      getServerList();
      isIntialMount.current = false;
      getFriendsList();
    }
  }, [getServerList, getFriendsList]);

  useEffect(() => {
    if (!currentChannel || !socketRef.current) return;

    console.log("Joining Channel:", currentChannel._id); // Join the Channel
    socketRef.current.emit("join-channel", currentChannel._id);
    getMessagesList(currentChannel._id);

    return () => {
      if (socketRef.current) {
        // Cleanup Function will Disconnect the Room which was joined
        console.log("Leaving Channel", currentChannel._id);
        socketRef.current.emit("leave-channel", currentChannel._id);
      }
    };
  }, [currentChannel, currentChannel?._id, getMessagesList]);

  useEffect(() => {
    // UseEffect when Current Server Changes
    if (!currentServer || !socketRef.current) return;

    console.log("Joining Server", currentServer._id); // Join the Server
    socketRef.current.emit("join-server", currentServer._id);
    getChannelList(currentServer._id); // Get the Channel List of the Current Server

    return () => {
      if (socketRef.current) {
        console.log("Leaving Server", currentServer._id);
        socketRef.current.emit("leave-server", currentServer._id);
      }
    };
  }, [currentServer, currentServer?._id, getChannelList]);

  const value: ServerContextType = {
    view,
    setView,
    friendsView,
    setFriendsView,
    serverData,
    getServerList,
    currentServer,
    channelData,
    currentChannel,
    changeServers,
    changeChannels,
    messageInput,
    changeMessage,
    sendMessage,
    messages,
    leftSidebar,
    setLeftSidebar,
    rightSidebar,
    setRightSidebar,
    setAttachments,
    typingStatus,
    checkMessageInTransit,
    friendsList,
    friendRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    currentDM,
    changeDM,
    toggleReactions,
    replyMessage,
    setReplyMessage,
    createNewServer,
    joinServerViaInvite,
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
