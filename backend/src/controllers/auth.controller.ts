import asyncHandler from "src/middleware/asyncHandler";
import { Request, Response } from "express";
import { getMetaData } from "src/utils/auth.utils";
import AuthService from "src/services/auth.service";
import { env } from "src/config/env.config";

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

});

export const sendOTP = asyncHandler(async (req: Request, res: Response) => {

})

export const verifyOTP = asyncHandler(async (req: Request, res: Response) => {

})

