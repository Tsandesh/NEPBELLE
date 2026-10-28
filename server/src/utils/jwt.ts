import jwt, { type SignOptions } from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { env } from '../config/env.js';

export interface AccessPayload { sub: string; role: 'CUSTOMER' | 'ADMIN' }
export interface RefreshPayload { sub: string; jti: string }

export const signAccessToken = (p: AccessPayload) =>
  jwt.sign(p, env.JWT_ACCESS_SECRET, { expiresIn: env.ACCESS_TOKEN_TTL } as SignOptions);

export const signRefreshToken = (userId: string) => {
  const jti = randomUUID();
  const token = jwt.sign({ sub: userId, jti }, env.JWT_REFRESH_SECRET, {
    expiresIn: `${env.REFRESH_TOKEN_TTL_DAYS}d`,
  } as SignOptions);
  return { token, jti };
};

export const verifyAccessToken = (t: string) => jwt.verify(t, env.JWT_ACCESS_SECRET) as unknown as AccessPayload;
export const verifyRefreshToken = (t: string) => jwt.verify(t, env.JWT_REFRESH_SECRET) as unknown as RefreshPayload;
