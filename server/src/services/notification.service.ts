import type { Prisma } from '@prisma/client';
import { prisma } from '../config/db.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { sendEmail } from './notification/email.js';
import { sendTelegram, telegramEnabled } from './notification/telegram.js';
import { CUSTOMER_EMAILS, renderAdmin, renderCustomer, type AdminEvent, type CustomerEvent, type Extra, type MailOrder, type NotifyEvent } from './notification/templates.js';

const MAX_ATTEMPTS = 5;

export const notificationService = {
  /** Queue notifications. Never throws: a notification problem must not break an order. */
  async queueFor(order: MailOrder | null, events: NotifyEvent[], extra: Extra = {}) {
    if (!order) return;
    try {
      const rows: Prisma.NotificationCreateManyInput[] = [];
      for (const ev of events) {
        if (ev.startsWith('ADMIN_')) {
          const m = renderAdmin(ev as AdminEvent, order, extra);
          rows.push({ orderId: order.id, channel: 'EMAIL', event: ev, recipient: env.ADMIN_NOTIFY_EMAIL, subject: m.subject, bodyText: m.text, bodyHtml: m.html });
          if (telegramEnabled()) rows.push({ orderId: order.id, channel: 'TELEGRAM', event: ev, recipient: String(env.TELEGRAM_CHAT_ID), bodyText: `${m.subject}\n\n${m.text}` });
        } else if (CUSTOMER_EMAILS[ev as CustomerEvent]) {
          const m = renderCustomer(ev as CustomerEvent, order, extra);
          rows.push({ orderId: order.id, channel: 'EMAIL', event: ev, recipient: order.email, subject: m.subject, bodyText: m.text, bodyHtml: m.html });
        }
      }
      if (rows.length) await prisma.notification.createMany({ data: rows });
      void this.flush();
    } catch (err) {
      logger.error({ err }, 'could not queue notifications');
    }
  },

  /** Send pending/retryable notifications. Safe to run concurrently: each row is claimed atomically. */
  async flush(limit = 20) {
    const now = Date.now();
    const candidates = await prisma.notification.findMany({
      where: { OR: [
        { status: 'PENDING' },
        { status: 'FAILED', attempts: { lt: MAX_ATTEMPTS } },
        { status: 'SENDING', updatedAt: { lt: new Date(now - 5 * 60_000) } }, // crashed mid-send
      ] },
      orderBy: { createdAt: 'asc' }, take: limit,
    });
    for (const n of candidates) {
      if (n.status === 'FAILED' && n.updatedAt.getTime() > now - n.attempts * 2 * 60_000) continue; // back off
      const claim = await prisma.notification.updateMany({
        where: { id: n.id, status: n.status, attempts: n.attempts },
        data: { status: 'SENDING', attempts: { increment: 1 } },
      });
      if (claim.count === 0) continue; // another worker took it
      try {
        if (n.channel === 'EMAIL') await sendEmail(n.recipient, n.subject ?? '(no subject)', n.bodyText, n.bodyHtml);
        else await sendTelegram(n.bodyText);
        await prisma.notification.update({ where: { id: n.id }, data: { status: 'SENT', sentAt: new Date(), lastError: null } });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger.warn({ id: n.id, channel: n.channel, event: n.event, message }, 'notification failed');
        await prisma.notification.update({ where: { id: n.id }, data: { status: 'FAILED', lastError: message.slice(0, 500) } });
      }
    }
  },
};