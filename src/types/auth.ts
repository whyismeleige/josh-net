import React, { Dispatch, ReactNode, SetStateAction } from "react";

export type UserRole = "student" | "admin" | "alumni" | "faculty";
export type ResponseType = "success" | "error" | "warning";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  phone: string;
  userName: string;
  nickName: string;
  avatar: string;
  status: string;
  bio: string;
  lastSeen: string;
  createdAt?: string;
}

export interface ApiResponse {
  message?: string;
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  type?: ResponseType;
  verificationId: string;
}

export interface AuthProviderProps {
  children: ReactNode;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginViaGoogle: (accessToken: string, refreshToken: string) => void;
  login: (email: string, password: string) => Promise<ApiResponse | undefined>;
  register: (email: string, password: string, username: string) => Promise<ApiResponse | undefined>;
  verifyOtp: (otp: string) => Promise<ApiResponse | undefined>;
  changePassword: (email: string, password: string) => Promise<ApiResponse | undefined>;
  logout: () => Promise<ApiResponse | undefined>;
  logoutAll: () => Promise<ApiResponse | undefined>;
}