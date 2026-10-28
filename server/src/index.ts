import { env } from './config/env.js';
import { prisma } from './config/db.js';
import { redis } from './config/redis.js';
import { logger } from './utils/logger.js';
import { createApp } from './app.js';

const server = createApp().listen(env.PORT, () => logger.info(`API listening on :${env.PORT}`));

const shutdown = async (signal: string) => {
  logger.info(`${signal} received, shutting down`);
  server.close(async () => {
    await Promise.allSettled([prisma.$disconnect(), redis.quit()]);
    process.exit(0);
  });
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
