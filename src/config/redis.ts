import Redis from "ioredis";
import env from "./env";

// Create Redis client with retry strategy and more logging
const redis = new Redis(env.REDIS_URL, {
  retryStrategy: (times) => {
    console.log(`Redis connection attempt #${times}`);
    if (times > 3) {
      console.error("Redis connection failed after 3 retries");
      process.exit(1);
    }
    return Math.min(times * 100, 3000); // Retry every 100ms, up to 3s
  },
  maxRetriesPerRequest: 3, // Limit retries per request
});

redis.on("connect", () => {
  console.log("Redis connected successfully");
});

redis.on("ready", () => {
  console.log("Redis client is ready to accept commands");
});

redis.on("error", (error) => {
  console.error("Redis connection error:", error.message);
});

redis.on("close", () => {
  console.log("Redis connection closed");
});

// Test the connection immediately
redis.ping((err, result) => {
  if (err) {
    console.error("Redis ping failed:", err.message);
  } else {
    console.log("Redis ping successful:", result); // Should log "PONG"
  }
});

export default redis;
