// src/cache/redisClient.ts
import IORedis from 'ioredis';

// Connection URL can be provided via env var REDIS_URL, otherwise default to localhost
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

export const redis = new IORedis(redisUrl);

export const getCached = async (key: string): Promise<string | null> => {
  try {
    return await redis.get(key);
  } catch (err) {
    console.warn('Redis get error', err);
    return null;
  }
};

export const setCached = async (key: string, value: string, ttlSeconds?: number): Promise<void> => {
  try {
    if (ttlSeconds) {
      await redis.set(key, value, 'EX', ttlSeconds);
    } else {
      await redis.set(key, value);
    }
  } catch (err) {
    console.warn('Redis set error', err);
  }
};
