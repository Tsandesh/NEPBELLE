import type { RequestHandler } from 'express';
import { AppError } from '../utils/AppError.js';
import { verifyAccessToken } from '../utils/jwt.js';

const extract = (header?: string) => (header?.startsWith('Bearer ') ? header.slice(7) : undefined);

export const requireAuth: RequestHandler = (req, _res, next) => {
  const token = extract(req.headers.authorization);
  if (!token) return next(AppError.unauthorized());
  try {
    const p = verifyAccessToken(token);
    req.user = { id: p.sub, role: p.role };
    next();
  } catch {
    next(AppError.unauthorized('Access token invalid or expired'));
  }
};

export const requireRole = (role: 'ADMIN'): RequestHandler => (req, _res, next) =>
  req.user?.role === role ? next() : next(AppError.forbidden());
