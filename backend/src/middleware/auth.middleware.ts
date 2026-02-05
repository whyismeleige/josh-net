import { Request, Response, NextFunction } from "express";
import redisClient from "@database/redis";
import User, { IUserDocument } from "@models/User.model";
import { verifyToken } from "@utils/auth.utils";
import { AuthorizationError, NotFoundError } from "@utils/error.utils";

export interface AuthRequest extends Request {
  user?: IUserDocument;
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.token;

  if (!token) {
    return next(new AuthorizationError("Unauthorized Access"));
  }

  try {
    const payload = verifyToken(token);
    if (!payload) return next(new AuthorizationError("Unauthorized Access"));

    const { id } = payload;

    let userString = await redisClient.get(id);
    let user: IUserDocument | null = null;

    if (!userString) {
      user = await User.findById(id);
      if (user) await redisClient.setEx(id, 300, JSON.stringify(user));
    } else {
      user = User.hydrate(JSON.parse(userString));
    }

    if (!user) {
      await redisClient.del(id);
      return next(new NotFoundError("User Not Found"));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new AuthorizationError("Invalid or Expired Session"));
  }
  next();
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AuthorizationError("Access Forbidden: Insufficient Permissions"),
      );
    }
    next();
  };
};
