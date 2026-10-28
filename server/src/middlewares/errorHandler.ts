import type { ErrorRequestHandler, RequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError.js';
import { errorBody } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

export const notFoundHandler: RequestHandler = (req, _res, next) =>
  next(AppError.notFound(`Route ${req.method} ${req.originalUrl} not found`));

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof AppError) {
    return res.status(err.status).json(errorBody(err.code, err.message, err.details));
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') return res.status(409).json(errorBody('CONFLICT', 'Resource already exists'));
    if (err.code === 'P2025') return res.status(404).json(errorBody('NOT_FOUND', 'Resource not found'));
  }
  if (err?.type === 'entity.parse.failed') return res.status(400).json(errorBody('BAD_JSON', 'Malformed JSON body'));
    if (err?.code === 'LIMIT_FILE_SIZE') return res.status(413).json(errorBody('FILE_TOO_LARGE', 'Image must be 5 MB or smaller.'));
  
  logger.error({ err, path: req.originalUrl }, 'unhandled error');
  res.status(500).json(errorBody('INTERNAL', 'Something went wrong'));
};
