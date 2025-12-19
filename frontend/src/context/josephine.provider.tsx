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
  ChatsData,
  Conversation,
  JosephineContextType,
} from "../types/josephine.types";
import { BACKEND_URL } from "../utils/config";
import { useAppSelector } from "../hooks/redux";
import { ParamValue } from "next/dist/server/request/params";
import { useRouter } from "next/navigation";

const JosephineContext = createContext<JosephineContextType | null>(null);

export function JosephineProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const { accessToken } = useAppSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [sidebar, setSidebar] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [chats, setChats] = useState<ChatsData[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatsData | null>(null);
  const [animateLastMessage, setAnimateLastMessage] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    try {
      console.log("Started Recording...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        await sendAudio(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      console.log("Stopping Recording...");
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const sendAudio = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/v1/josephine/voice-chat`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      const data = await response.json();
      console.log("Server Response", data);
    } catch (error) {
      console.error("Error uploading audio", error);
    }
  };

  const sendPrompt = () => {
    const userConversation: Conversation = {
      author: "user",
      message: prompt,
      timestamp: Date.now.toString(),
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

    fetch(`${BACKEND_URL}/api/v1/josephine/prompt`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, chatId: currentChat?._id || null }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setChats((prev) => [...prev, data.chat]);
        setAnimateLastMessage(true);
        if (data.isNewConversation)
          router.replace(`/student/josephine/chat/${data.chat._id}`);
        else if (currentChat)
          setCurrentChat({
            ...currentChat,
            conversationHistory: [
              ...currentChat.conversationHistory,
              userConversation,
              data.chat.conversationHistory[
                data.chat.conversationHistory.length - 1
              ],
            ],
          });
      });
    setPrompt("");
  };

  const listChats = () => {
    fetch(`${BACKEND_URL}/api/v1/josephine/chats`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setChats(data.chats));
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
          .then((data) => setCurrentChat(data.chat));
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
      isRecording,
      startRecording,
      stopRecording,
    }),
    [
      sidebar,
      prompt,
      chats,
      getChat,
      currentChat,
      animateLastMessage,
      isRecording,
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
