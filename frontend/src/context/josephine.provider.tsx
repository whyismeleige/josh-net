import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ChatAccess,
  ChatsData,
  Conversation,
  JosephineContextType,
} from "../types/josephine.types";
import { BACKEND_URL } from "../utils/config";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { ParamValue } from "next/dist/server/request/params";
import { useRouter, usePathname } from "next/navigation";
import { addNotification } from "../store/slices/notification.slice";
import { useIsMobile } from "@/hooks/use-mobile";

const JosephineContext = createContext<JosephineContextType | null>(null);

export function JosephineProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();

  const { accessToken } = useAppSelector((state) => state.auth);
  const access: ChatAccess = pathname.includes("share") ? "public" : "private";

  const [sidebar, setSidebar] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [chats, setChats] = useState<ChatsData[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatsData | null>(null);
  const [animateLastMessage, setAnimateLastMessage] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const deleteChat = (chatId: string) => {
    fetch(`${BACKEND_URL}/api/v1/josephine/chat/${chatId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => response.json())
      .then(() => {
        setChats((prev) => prev.filter((chat) => chat._id !== chatId));
        if (currentChat?._id === chatId) {
          setCurrentChat(null);
          router.replace("/student/josephine/new");
        }
        dispatch(
          addNotification({
            type: "success",
            title: "Success",
            description: "Successfully Deleted Chat",
          })
        );
      })
      .catch((error) =>
        dispatch(
          addNotification({
            type: "error",
            title: "Error in Deleting Chat",
            description: error.message,
          })
        )
      );
  };

  const changeChatDetails = useCallback(
    (
      details: {
        changeStar?: boolean;
        newName?: string;
        changeAccess?: boolean;
      },
      chatId: string
    ) => {
      fetch(`${BACKEND_URL}/api/v1/josephine/chat/${chatId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ details }),
      })
        .then((response) => response.json())
        .then(() =>
          setChats((prev) => {
            const current = [...prev];
            const index = current.findIndex((chat) => chat._id === chatId);

            current[index] = {
              ...current[index],
              ...(details.changeStar && {
                isStarred: !current[index].isStarred,
              }),
              ...(details.changeAccess && {
                access:
                  current[index].access === "public" ? "private" : "public",
              }),
              ...(details.newName && { title: details.newName }),
            };

            if (current[index]._id === currentChat?._id)
              setCurrentChat(current[index]);

            return current;
          })
        )
        .catch((error) =>
          dispatch(
            addNotification({
              type: "error",
              title: "Error in Modifying Chat",
              description: error.message,
            })
          )
        );
    },
    [accessToken, chats]
  );

  const sendPrompt = useCallback(async () => {
    try {
      setPrompt("");
      setSelectedFiles([]);

      const formData = new FormData();

      selectedFiles.forEach((file) => formData.append("files", file));
      formData.append("prompt", prompt);
      formData.append("chatId", currentChat?._id || "");

      const userConversation: Conversation = {
        author: "user",
        message: prompt,
        timestamp: Date.now.toString(),
        attachments: [],
      };
      if (currentChat) {
        setCurrentChat({
          ...currentChat,
          conversationHistory: [
            ...currentChat.conversationHistory,
            userConversation,
          ],
        });
      }

      const response = await fetch(`${BACKEND_URL}/api/v1/josephine/prompt`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      const data = await response.json();

      setChats((prev) => [...prev, data.chat]);
      setAnimateLastMessage(true);

      if (data.isNewConversation)
        router.replace(`/student/josephine/chat/${data.chat._id}`);
      else if (currentChat) setCurrentChat(data.chat);
    } catch (error) {
      dispatch(
        addNotification({
          type: "error",
          title: "Error in Retrieving List of Chats",
          description: error instanceof Error ? error.message : "Server Error",
        })
      );
    }
  }, [accessToken, currentChat, prompt, router, selectedFiles]);

  const listChats = () => {
    fetch(`${BACKEND_URL}/api/v1/josephine/chats`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setChats(data.chats))
      .catch((error) =>
        dispatch(
          addNotification({
            type: "error",
            title: "Error in Retrieving List of Chats",
            description: error.message,
          })
        )
      );
  };

  const getChat = useCallback(
    (chatId: ParamValue) => {
      {
        if (currentChat?._id === chatId) return;
        fetch(`${BACKEND_URL}/api/v1/josephine/chat/${chatId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
          .then((response) => response.json())
          .then((data) => setCurrentChat(data.chat))
          .catch((error) =>
            dispatch(
              addNotification({
                type: "error",
                title: "Error in Retrieving Chat",
                description: error.message,
              })
            )
          );
      }
    },
    [accessToken]
  );

  const resetState = () => {
    setCurrentChat(null);
  };

  useEffect(() => {
    listChats();
  }, [accessToken]);

  useEffect(() => {
    if (isMobile !== undefined) {
      setSidebar(!isMobile);
    }
  }, [isMobile]);

  // Upcoming Voice Feature - To Do

  // const [isRecording, setIsRecording] = useState(false);
  // const mediaRecorderRef = useRef<MediaRecorder>(null);
  // const audioChunksRef = useRef<BlobPart[]>([]);

  // const startRecording = async () => {
  //   try {
  //     console.log("Started Recording...");
  //     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  //     mediaRecorderRef.current = new MediaRecorder(stream);
  //     audioChunksRef.current = [];

  //     mediaRecorderRef.current.ondataavailable = (event) => {
  //       audioChunksRef.current.push(event.data);
  //     };

  //     mediaRecorderRef.current.onstop = async () => {
  //       const audioBlob = new Blob(audioChunksRef.current, {
  //         type: "audio/webm",
  //       });
  //       await sendAudio(audioBlob);
  //     };

  //     mediaRecorderRef.current.start();
  //     setIsRecording(true);
  //   } catch (error) {
  //     console.error("Error accessing microphone", error);
  //   }
  // };

  // const stopRecording = () => {
  //   if (mediaRecorderRef.current && isRecording) {
  //     console.log("Stopping Recording...");
  //     mediaRecorderRef.current.stop();
  //     mediaRecorderRef.current.stream
  //       .getTracks()
  //       .forEach((track) => track.stop());
  //     setIsRecording(false);
  //   }
  // };

  // const sendAudio = async (audioBlob: Blob) => {
  //   const formData = new FormData();
  //   formData.append("audio", audioBlob, "recording.webm");

  //   try {
  //     const response = await fetch(
  //       `${BACKEND_URL}/api/v1/josephine/voice-chat`,
  //       {
  //         method: "POST",
  //         headers: {
  //           Authorization: `Bearer ${accessToken}`,
  //         },
  //         body: formData,
  //       }
  //     );

  //     const data = await response.json();
  //     console.log("Server Response", data);
  //   } catch (error) {
  //     console.error("Error uploading audio", error);
  //   }
  // };

  const value = useMemo(
    () => ({
      sidebar,
      setSidebar,
      prompt,
      setPrompt,
      chats,
      getChat,
      currentChat,
      sendPrompt,
      animateLastMessage,
      resetState,
      setSelectedFiles,
      changeChatDetails,
      access,
      deleteChat,
    }),
    [
      sidebar,
      prompt,
      chats,
      getChat,
      currentChat,
      animateLastMessage,
      changeChatDetails,
    ]
  );

  return (
    <JosephineContext.Provider value={value}>
      {children}
    </JosephineContext.Provider>
  );
}

export function useJosephineContext() {
  const context = useContext(JosephineContext);

  if (!context) {
    throw new Error(
      "Use Josephine Context should be used withing a Josephine Provider"
    );
  }

  return context;
}
