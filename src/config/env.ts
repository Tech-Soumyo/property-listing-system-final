import { config } from "dotenv";
import { z } from "zod";

// Load environment variables from .env file
config();

// Define schema for environment variables
const envSchema = z.object({
  PORT: z.string().default("3000"),
  MONGO_URI: z.string().min(1, "MongoDB URI is required"),
  REDIS_URL: z.string().min(1, "Redis URL is required"),
  JWT_SECRET: z.string().min(1, "JWT Secret is required"),
});

// Parse and validate environment variables
const env = envSchema.parse({
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  REDIS_URL: process.env.REDIS_URL,
  JWT_SECRET: process.env.JWT_SECRET,
});

// Export validated environment variables
export default env;
