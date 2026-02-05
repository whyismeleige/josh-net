import jwt from "jsonwebtoken";
import geoip from "geoip-lite";
import { UAParser } from "ua-parser-js";
import { Request } from "express";
import { env } from "src/config/env.config";
import { IUserDocument } from "src/models/User.model";
import { JWTPayload } from "src/types/jwt.types";

export const getMetaData = (req: Request) => {
  const ipAddress = req.ip || req.socket.remoteAddress;

  const userAgent = req.headers["user-agent"];

  const geo = ipAddress ? geoip.lookup(ipAddress) : null;

  const parser = new UAParser(userAgent);

  return {
    ipAddress: ipAddress || null,
    userAgent,
    browser: parser.getBrowser(),
    os: parser.getOS(),
    device: parser.getDevice(),
    location: geo
      ? {
          country: geo.country,
          region: geo.region,
          city: geo.city,
          latitude: geo.ll[0],
          longitude: geo.ll[1],
          timezone: geo.timezone,
        }
      : null,
  };
};

export const createToken = (payload: JWTPayload) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRE as jwt.SignOptions["expiresIn"],
  });
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
};

export const sanitizeUser = (user: IUserDocument) => {
  return {
    _id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarURL: user.avatarURL,
    profile: {
      userName: user.profile?.userName,
    },
    activity: {
      lastLogin: user.activity?.lastLogin,
    },
    security: {
      twoFactorEnabled: user.security.twoFactorEnabled,
      emailVerified: user.security.emailVerified,
      numberVerified: user.security.numberVerified,
      mustChangePassword: user.security.mustChangePassword,
    },
  };
};
