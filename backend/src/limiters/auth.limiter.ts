import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    message: "Too many login attempts, Please Try again after 15 minutes",
    type: "error",
  },
  standardHeaders: true,
  legacyHeaders: true,
});

export const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    message: "Too many OTP requests, please try again later",
    type: "error",
  },
});

export const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

