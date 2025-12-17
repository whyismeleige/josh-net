import { ParamValue } from "next/dist/server/request/params";

export type ChatAccess = "public" | "private";
export type Authors = "user" | "ai" | "assistant";

export interface Conversation {
  author: Authors;
  message: string;
  timestamp: string;
}

export interface ChatsData {
  _id: string;
  title: string;
  userId: string;
  conversationHistory: Conversation[];
  access: ChatAccess;
  aiModel: string;
  createdAt: string;
  updatedAt: string;
}

export interface JosephineContextType {
  sidebar: boolean;
  setSidebar: (toggle: boolean) => void;
  prompt: string;
  setPrompt: (value: string) => void;
  chats: ChatsData[];
  getChat: (chatId: ParamValue) => void;
  currentChat: ChatsData | null;
  sendPrompt: () => void;
  animateLastMessage: boolean;
  resetState: () => void;
}
