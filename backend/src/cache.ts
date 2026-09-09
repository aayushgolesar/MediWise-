const CATALOG_TTL_MS = 60_000;
const memoryStore = new Map<string, { value: string; expiresAt: number }>();

interface RedisLike {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, expiryMode?: string, ttl?: number) => Promise<unknown>;
}

let redisClient: RedisLike | null | undefined;

const shouldUseRedis = (): boolean => {
  if (process.env.NODE_ENV === 'test') return false;
  if (process.env.REDIS_DISABLED === '1') return false;
  return Boolean(process.env.REDIS_URL);
};

const getRedis = async (): Promise<RedisLike | null> => {
  if (!shouldUseRedis()) return null;
  if (redisClient !== undefined) return redisClient;

  try {
    const ioredisModule = await import('ioredis');
    const RedisConstructor = (ioredisModule.default || ioredisModule) as unknown as new (url: string, opts: Record<string, unknown>) => RedisLike & { on: (ev: string, cb: () => void) => void; connect: () => Promise<void> };
    const client = new RedisConstructor(process.env.REDIS_URL ?? 'redis://127.0.0.1:6379', {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });
    client.on('error', () => {
      redisClient = null;
    });
    await client.connect();
    redisClient = client;
    return redisClient;
  } catch {
    redisClient = null;
    return null;
  }
};

export const getCached = async (key: string): Promise<string | null> => {
  const redis = await getRedis();
  if (redis) {
    try {
      return await redis.get(key);
    } catch {
      // fall through to memory
    }
  }

  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    memoryStore.delete(key);
    return null;
  }
  return entry.value;
};

export const setCached = async (key: string, value: string, ttlSeconds = CATALOG_TTL_MS / 1000): Promise<void> => {
  const redis = await getRedis();
  if (redis) {
    try {
      await redis.set(key, value, 'EX', ttlSeconds);
      return;
    } catch {
      // fall through to memory
    }
  }

  memoryStore.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
};

export const catalogCacheKey = (category?: string, schedule?: string, search?: string): string =>
  `medicines:${category ?? ''}:${schedule ?? ''}:${search ?? ''}`;
