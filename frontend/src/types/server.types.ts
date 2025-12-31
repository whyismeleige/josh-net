import { EmojiClickData } from "emoji-picker-react";
import { User } from "./auth.types";

export type ViewMode = "inbox" | "servers" | "friends";

export type FriendsState = "all" | "requests" | "pending";

export type FriendRequestStatus = "outgoing" | "incoming";

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

export interface Reaction {
  emoji: string;
  users: { user: string; timestamp: string }[];
  count: number;
}

export interface Friend {
  _id: string;
  user: User;
  channel: ChannelData;
  since: string;
}

export interface FriendRequests {
  _id: string;
  user: User;
  status: FriendRequestStatus;
  requestedAt: string;
}

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
  reactions: Reaction[];
  deletedAt?: string | null;
  editedTimestamp?: string | null;
  timestamp: string;
  type: MessageType;
  updatedAt: string;
  userId: User;
}

export interface ServerContextType {
  view: ViewMode;
  setView: (view: ViewMode) => void;
  friendsView: FriendsState;
  setFriendsView: (view: FriendsState) => void;
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
  friendsList: Friend[];
  friendRequests: FriendRequests[];
  sendFriendRequest: (receiverId: string) => Promise<void>;
  acceptFriendRequest: (userId: string) => Promise<void>;
  rejectFriendRequest: (userId: string) => Promise<void>;
  cancelFriendRequest: (userId: string) => Promise<void>;
  currentDM: Friend | null;
  changeDM: (dm: Friend) => void;
  toggleReactions: (messageId: string, emojiObject: EmojiClickData) => void;
}
