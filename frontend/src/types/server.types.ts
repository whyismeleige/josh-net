import { User } from "./auth.types";

export type ChannelType =
  | "dm"
  | "group_dm"
  | "guild_announcement"
  | "guild_text";

export type ServerType =
  | "class"
  | "department"
  | "college"
  | "committee"
  | "club"
  | "project"
  | "study_group"
  | "general";

export type MessageType = "text" | "image" | "file" | "embed";

export interface ServerData {
  _id: string;
  name: string;
  description: string;
  createdBy: User | string;
  icon: string;
  banner: string;
  serverType: ServerType;
  channels: string[];
  users: User[];
  leaders: User[];
  createdAt: string;
  updatedAt: string;
}

export interface ChannelData {
  _id: string;
  name: string;
  description: string;
  messages: string[];
  type: ChannelType;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageData {
  _id: string;
  content: string;
  createdAt: string;
  deleted: string;
  deletedAt?: string | null;
  editedTimestamp?: string | null;
  timestamp: string;
  type: MessageType;
  updatedAt: string;
  userId: User;
}

export interface ServerContextType {
  serverData: ServerData[];
  getServerList: () => void;
  currentServer: ServerData | null;
  channelData: ChannelData[];
  currentChannel: ChannelData | null;
  changeServers: (server: ServerData) => void;
  changeChannels: (channel: ChannelData) => void;
  messageInput: string;
  setMessageInput: (value: string) => void;
  sendMessage: () => void;
  messages: MessageData[];
  leftSidebar: boolean;
  setLeftSidebar: (toggle: boolean) => void;
  rightSidebar: boolean;
  setRightSidebar: (toggle: boolean) => void;
  setAttachments: (files: File[]) => void;
}
