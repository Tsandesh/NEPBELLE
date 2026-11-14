import { redis } from '../config/redis.js';
import { notificationService } from '../services/notification.service.js';
import { logger } from '../utils/logger.js';

export const startNotificationJob = () => {
  const run = async () => {
    const lock = await redis.set('lock:notify-flush', '1', 'EX', 50, 'NX').catch(() => null);
    if (lock !== 'OK') return;
    try { await notificationService.flush(); } catch (err) { logger.error({ err }, 'notification flush failed'); }
  };
  const timer = setInterval(run, 60_000);
  return () => clearInterval(timer);
};