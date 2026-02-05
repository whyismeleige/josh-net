import { Document, Types } from "mongoose";

export type UserRole = "student" | "admin" | "faculty" | "alumni";

// User Types
export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password?: string;
  number?: string;
  name: string;
  role: UserRole;
  avatarURL: string;
  googleID?: string;
  providers: ("google" | "local")[];
  profile?: {
    userName?: string;
  };
  academic?: {
    course?: string;
    currentSemester?: string;
    year?: string;
  };
  isClassRepresentative: boolean;
  activity: {
    lastLogin: Date;
    totalLogins: Array<{
      loginTime: Date;
      attemptsReached: number;
      maxAttemptsReached: boolean;
      metadata?: IMetadata;
    }>;
  };
  security: {
    twoFactorEnabled: boolean;
    loginAttempts: number;
    emailVerified: boolean;
    numberVerified: boolean;
    lockUntil?: Date;
    mustChangePassword: boolean;
    passwordChangedAt?: Date;
    passwordHistory: Array<{
      password: string;
      changedAt: Date;
    }>;
  };
  isActive: boolean;
  refreshTokens: Array<{
    token: string;
    createdAt: Date;
    metadata?: IMetadata;
  }>;
  servers: Types.ObjectId[];
  chats: Types.ObjectId[];
  friends: Array<{
    user: Types.ObjectId;
    channel: Types.ObjectId;
    since: Date;
  }>;
  requests: Array<{
    user: Types.ObjectId;
    status: "outgoing" | "incoming";
    requestedAt: Date;
  }>;
  blockedUsers: Array<{
    user: Types.ObjectId;
    blockedAt: Date;
    reason: string;
  }>;

  // Methods
  changePassword(newPassword: string): Promise<void>;
  isLocked(): boolean;
  passwordsMatch(password: string): Promise<boolean>;
  inSuccessfulLogin(): Promise<void>;
  successfulLogin(metadata?: IMetadata): Promise<void>;
}

export interface IMetadata {
  ipAddress?: string;
  userAgent?: string;
  browser?: {
    name?: string;
    version?: string;
    major?: string;
  };
  os?: {
    name?: string;
    version?: string;
  };
  device?: {
    vendor?: string;
    model?: string;
    type?: string;
  };
  location?: {
    country?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
  };
}
