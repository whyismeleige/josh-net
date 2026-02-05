import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name is required"),
    email: z.email("Invalid Email Address"),
    password: z.string().min(6, "Password must be atleast 6 characters"),
    role: z
      .enum(["student", "admin", "faculty", "alumni"])
      .optional()
      .default("student"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.email("Invalid Email Address"),
    password: z.string().min(1, "Password is required"),
  }),
});
