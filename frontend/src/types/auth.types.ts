import { NotificationType } from "./notification.types";

export type Role = "student" | "admin" | "faculty" | "alumni";
export type Mode = "Login" | "Sign Up";
export type VerificationPurpose = "email_verification" | "sms_verification" | "password_reset" | "two_factor_auth";

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

export interface APIResponse {
  message: string;
  type: NotificationType;
}

export interface LocalAuthResponse extends APIResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
  verificationId?: string;
}
