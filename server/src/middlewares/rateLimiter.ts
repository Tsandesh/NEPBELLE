import type { Request, RequestHandler } from 'express';
import { redis } from '../config/redis.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

interface Options {
  prefix: string;
  windowSec: number;
  max: number;
  key?: (req: Request) => string;
}

/** Fixed-window limiter backed by Redis. Fails open if Redis is down (availability over strictness). */
export const rateLimit = ({ prefix, windowSec, max, key }: Options): RequestHandler =>
  async (req, res, next) => {
    const id = key ? key(req) : req.ip ?? 'unknown';
    const k = `rl:${prefix}:${id}`;
    try {
      const count = await redis.incr(k);
      if (count === 1) await redis.expire(k, windowSec);
      const ttl = await redis.ttl(k);
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - count));
      if (count > max) {
        res.setHeader('Retry-After', Math.max(ttl, 1));
        return next(new AppError(429, 'RATE_LIMITED', 'Too many requests, please try again later.'));
      }
    } catch (err) {
      logger.warn({ err }, 'rate limiter bypassed (redis unavailable)');
    }
    next();
  };

export const globalLimiter = rateLimit({ prefix: 'global', windowSec: 60, max: 300 });
export const authLimiter = rateLimit({
  prefix: 'auth',
  windowSec: 15 * 60,
  max: 10,
  key: (req) => `${req.ip}:${String(req.body?.email ?? '').toLowerCase()}`,
});
