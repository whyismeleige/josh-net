export type Role = "student" | "admin" | "faculty" | "alumni";

export interface User {
  _id: string;
  email: string;
  name: string;
  role: Role;
  avatarURL: string;
  profile?: {
    userName?: string;
  };
  activity?: {
    lastLogin: string;
  };
  security?: {
    twoFactorEnabled: boolean;
    emailVerified: boolean;
    numberVerified: boolean;
    mustChangePassword: boolean;
  };
  createdAt: string;
  updatedAt: string;
}
