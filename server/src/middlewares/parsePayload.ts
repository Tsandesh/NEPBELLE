import type { RequestHandler } from 'express';
import { AppError } from '../utils/AppError.js';

// multipart requests carry JSON in a text field called "payload"
export const parseJsonPayload: RequestHandler = (req, _res, next) => {
  try { req.body = JSON.parse(req.body?.payload ?? '{}'); next(); }
  catch { next(AppError.badRequest('Invalid request payload')); }
};