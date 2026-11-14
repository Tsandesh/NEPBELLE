import type { ErrorRequestHandler, RequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError.js';
import { errorBody } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';
import { isProd } from '../config/env.js';

export const notFoundHandler: RequestHandler = (req, _res, next) =>
  next(AppError.notFound(`Route ${req.method} ${req.originalUrl} not found`));

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof AppError) {
    return res.status(err.status).json(errorBody(err.code, err.message, err.details));
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') return res.status(409).json(errorBody('CONFLICT', 'Resource already exists'));
    if (err.code === 'P2025') return res.status(404).json(errorBody('NOT_FOUND', 'Resource not found'));
    // any other database error falls through to the logged 500 below
  }

  // JSON body problems (express.json)
  if (err?.type === 'entity.parse.failed') return res.status(400).json(errorBody('BAD_JSON', 'Malformed JSON body'));
  if (err?.type === 'entity.too.large') return res.status(413).json(errorBody('BODY_TOO_LARGE', 'Request body is too large'));

  // Upload problems (multer) — only genuine multer errors count
  if (err?.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json(errorBody('FILE_TOO_LARGE', 'Image must be 5 MB or smaller.'));
    return res.status(400).json(errorBody('UPLOAD_ERROR', 'The file could not be uploaded.'));
  }

  logger.error({ err, method: req.method, path: req.originalUrl }, 'unhandled error');
  res.status(500).json(
    errorBody('INTERNAL', 'Something went wrong', isProd ? undefined : { cause: String(err?.message ?? err).slice(0, 400) }),
  );
};