import { createClient, RedisClientType } from "redis";
import dotenv from "dotenv";

dotenv.config();

// Create the client with proper typing
// We cast the return of createClient to RedisClientType for better intellisense across the app
const redisClient: RedisClientType = createClient({
  socket: {
    host: (process.env.REDIS_HOST as string) || "localhost",
    // Ensure port is a number, not a string
    port: parseInt(process.env.REDIS_PORT as string, 10) || 6379,
  },
  // Only provide password if it exists, otherwise undefined
  password: (process.env.REDIS_PASSWORD as string) || undefined,
});

redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

redisClient.on("error", (err: Error) => {
  console.error("Redis Client error", err);
});

// Self-executing async function to handle the initial connection
(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error("Failed to connect to Redis", error);
  }
})();

export default redisClient;