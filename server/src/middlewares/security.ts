import cors from 'cors';
import helmet from 'helmet';
import { env } from '../config/env.js';

export const securityHeaders = helmet();
export const corsMiddleware = cors({
  origin: env.CLIENT_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
});
