import { CacheEntry } from "@/types";

const DEFAULT_TTL = 300;

const cache = new Map<string, CacheEntry<unknown>>();

function getTTL(): number {
  const envTTL = process.env.CACHE_TTL_SECONDS;
  return envTTL ? parseInt(envTTL, 10) : DEFAULT_TTL;
}

export function cacheGet<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;

  const ttl = getTTL() * 1000;
  if (Date.now() - entry.timestamp > ttl) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

export function cacheSet<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export function cacheInvalidate(key: string): void {
  cache.delete(key);
}

export function cacheInvalidatePrefix(prefix: string): void {
  const keys = Array.from(cache.keys());
  for (const key of keys) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

export function cacheInvalidateAll(): void {
  cache.clear();
}
