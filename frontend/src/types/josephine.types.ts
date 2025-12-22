import { ParamValue } from "next/dist/server/request/params";

export type ChatAccess = "public" | "private";
export type Authors = "user" | "ai" | "assistant";

export interface Attachment {
  title: string;
  s3Key: string;
  s3URL: string;
}

export interface Conversation {
  author: Authors;
  message: string;
  timestamp: string;
  attachments: Attachment[];
}

export interface ChatsData {
  _id: string;
  title: string;
  userId: string;
  conversationHistory: Conversation[];
  access: ChatAccess;
  aiModel: string;
  isStarred: boolean;
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
  sendPrompt: () => Promise<void>;
  animateLastMessage: boolean;
  resetState: () => void;
  setSelectedFiles: (files: File[]) => void;
  changeChatDetails: (
    details: {
      changeStar?: boolean;
      newName?: string;
      changeAccess?: boolean;
    },
    chatId: string
  ) => void;
  access: ChatAccess;
  deleteChat: (chatId: string) => void;
}
