import { S3Client } from "@aws-sdk/client-s3";
import { env } from "./env.config";

// Ensure the variables are treated as strings, or fallback to empty strings to avoid TS errors
const s3Client = new S3Client({
  region: env.AWS_REGION as string,
  credentials: {
    accessKeyId: env.AWS_S3_ACCESS_KEY as string,
    secretAccessKey: env.AWS_S3_SECRET_ACCESS_KEY as string,
  },
});

export default s3Client;