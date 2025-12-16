export type ChatAccess = "public" | "private";
export type Authors = "user" | "ai";

export interface Conversation {
  author: Authors;
  message: string;
  timestamp: string;
}

export interface ChatsData {
  _id: string;
  title: string;
  userId: string;
  convesationHistory: Conversation;
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
}
