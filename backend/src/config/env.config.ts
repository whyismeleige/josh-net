import dotenv from "dotenv";
import { z } from "zod";

// Load environment variables from .env file
dotenv.config();

// Define the schema for your environment variables
const envSchema = z.object({
  // Server Configuration
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default(8080),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  FRONTEND_URL: z.url().default("http://localhost:3000"),

  // JWT Configuration
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  JWT_EXPIRE: z.string().min(1, "JWT_EXPIRE is required"),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),

  // Database
  MONGODB_URI: z.url().min(1, "MONGODB_URI is required"),
  DB_NAME: z.string().min(1, "DB_NAME is required"),

  // External Services
  SCRAPING_URL: z.url().optional(), // Optional if not always needed

  // AWS Configuration
  AWS_REGION: z.string().min(1, "AWS_REGION is required"),
  AWS_S3_ACCESS_KEY: z.string().min(1, "AWS_S3_ACCESS_KEY is required"),
  AWS_S3_SECRET_ACCESS_KEY: z.string().min(1, "AWS_S3_SECRET_ACCESS_KEY is required"),
  S3_BUCKET_NAME: z.string().min(1, "S3_BUCKET_NAME is required"),

  // AI Services
  ANTHROPIC_API_KEY: z.string().min(1, "ANTHROPIC_API_KEY is required"),

  // CDN
  CDN_URL: z.url().optional(),
});

// Parse and validate process.env
// If validation fails, this will throw a detailed error
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:");
  _env.error.format();
  
  // Format errors to be readable
  const formattedErrors = Object.entries(_env.error.format())
    .map(([name, value]) => {
      if (value && "_errors" in value) return `${name}: ${value._errors.join(", ")}`;
      return null;
    })
    .filter(Boolean);

  console.error(formattedErrors.join("\n"));
  
  process.exit(1); // Exit the application immediately
}

export const env = _env.data;