import { env } from "@config/env.config";
import asyncHandler from "@middleware/asyncHandler";
import AuthService from "@services/auth.service";
import { getMetaData } from "@utils/auth.utils";
import { Request, Response } from "express"

const getCookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const metadata = getMetaData(req);

  const { token, ...result } = await AuthService.registerUser(
    req.body,
    metadata,
  );

  res.cookie("token", token, getCookieOptions());

  res.status(201).send({
    message: "User registered successfully",
    type: "success",
    ...result,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const metadata = getMetaData(req);

  const { token, ...result } = await AuthService.loginUser(req.body, metadata);

  res.cookie("token", token, getCookieOptions());

  res.status(200).send({
    message: "User Logged In successfully",
    type: "success",
    ...result,
  });
});

export const sendOTP = asyncHandler(async (req: Request, res: Response) => {});

export const verifyOTP = asyncHandler(
  async (req: Request, res: Response) => {},
);
