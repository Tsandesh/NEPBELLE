import { createHash } from 'node:crypto';
import { redis } from '../config/redis.js';
import { logger } from './logger.js';

const NS_KEY = 'cache:products:ns';

/** Cache-aside with namespace versioning so product writes invalidate all list caches at once. */
export async function cached<T>(key: string, ttlSec: number, loader: () => Promise<T>): Promise<T> {
  try {
    const ns = (await redis.get(NS_KEY)) ?? '1';
    const full = `cache:${ns}:${key}`;
    const hit = await redis.get(full);
    if (hit) return JSON.parse(hit) as T;
    const value = await loader();
    await redis.set(full, JSON.stringify(value), 'EX', ttlSec);
    return value;
  } catch (err) {
    logger.warn({ err }, 'cache unavailable, falling back to source');
    return loader();
  }
}

export const invalidateProductCache = () => redis.incr(NS_KEY).catch(() => undefined);
export const hashKey = (obj: unknown) => createHash('sha1').update(JSON.stringify(obj)).digest('hex');
