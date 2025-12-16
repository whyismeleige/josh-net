import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { ChatsData, JosephineContextType } from "../types/josephine.types";
import { BACKEND_URL } from "../utils/config";
import { useAppSelector } from "../hooks/redux";

const JosephineContext = createContext<JosephineContextType | null>(null);

export function JosephineProvider({ children }: { children: ReactNode }) {
  const { accessToken } = useAppSelector((state) => state.auth);

  const [sidebar, setSidebar] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [chats, setChats] = useState<ChatsData[]>([]);

  const getChats = () => {
    fetch(`${BACKEND_URL}/api/v1/josephine/chats`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setChats(data.chats));
  };

  useEffect(() => {
    getChats();
  },[])

  const value: JosephineContextType = {
    sidebar,
    setSidebar,
    prompt,
    setPrompt,
    chats
  };

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
