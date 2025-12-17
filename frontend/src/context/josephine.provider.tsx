import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
    }),
    [sidebar, prompt, chats, getChat, currentChat, animateLastMessage]
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
