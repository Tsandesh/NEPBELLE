import express from 'express';
import cookieParser from 'cookie-parser';
import { pinoHttp } from 'pino-http';
import { logger } from './utils/logger.js';
import { corsMiddleware, securityHeaders } from './middlewares/security.js';
import { globalLimiter } from './middlewares/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { UPLOAD_DIR } from './config/uploads.js';
import routes from './routes/index.js';

export const createApp = () => {
  const app = express();
  app.set('trust proxy', 1);
  app.use(pinoHttp({ logger }));
  app.use('/uploads', express.static(UPLOAD_DIR, {
  maxAge: '7d', immutable: true, index: false, // filenames are unique UUIDs, so long caching is safe
  setHeaders: (res) => res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'),
}));
  app.use(securityHeaders);
  app.use(corsMiddleware);
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/v1', globalLimiter, routes);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
};
