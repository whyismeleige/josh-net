import { User } from "./auth.types";

export type ServerType =
  | "class"
  | "department"
  | "college"
  | "committee"
  | "club"
  | "project"
  | "study_group"
  | "general";

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

export interface ServerContextType {
  serverData: ServerData[];
  getServerList: () => void;
  currentServer: ServerData | null;
  setCurrentServer: (data: ServerData) => void;
}
