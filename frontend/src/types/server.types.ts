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

export type AttachmentTransferProcess = "download" | "upload";

export interface Attachment {
  fileName: string;
  fileSize: number;
  id: string;
  mimeType: string;
  s3Key: string;
  s3URL: string;
  _id: string;
  transferring?: boolean;
  transferProcess?: AttachmentTransferProcess;
  transferProgress?: number;
}

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
  content?: string | null;
  createdAt: string;
  deleted: string;
  attachments: Attachment[];
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
  changeMessage: (message: string) => void;
  sendMessage: () => Promise<void>;
  messages: MessageData[];
  leftSidebar: boolean;
  setLeftSidebar: (toggle: boolean) => void;
  rightSidebar: boolean;
  setRightSidebar: (toggle: boolean) => void;
  setAttachments: (files: File[]) => void;
  typingStatus: string;
  checkMessageInTransit: (messageId: string) => boolean;
}
