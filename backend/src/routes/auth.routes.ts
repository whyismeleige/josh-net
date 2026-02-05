import express from "express";
import * as controller from "../controllers/auth.controller";
import * as middleware from "../middleware/auth.middleware";
import * as validator from "../validators/auth.validator";
import * as limiter from "../limiters/auth.limiter";
import { validate } from "@middleware/validate.middleware";

const router = express.Router();

router.post(
  "/login",
  limiter.loginLimiter,
  validate(validator.loginSchema),
  controller.login,
);

router.post(
  "/register",
  limiter.publicLimiter,
  validate(validator.registerSchema),
  controller.register,
);

export default router;
