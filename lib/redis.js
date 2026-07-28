import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

let redis;

if (process.env.NODE_ENV === "production") {
  redis = new Redis(redisUrl);
} else {
  // Prevent multiple Redis client instances from being created during Next.js hot-reloads
  if (!global.redis) {
    global.redis = new Redis(redisUrl);
  }
  redis = global.redis;
}

export default redis;
