import nodemailer, { type Transporter } from 'nodemailer';
import { env, isProd } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

let transport: Transporter | null = null;
const get = () =>
  (transport ??= nodemailer.createTransport({
    host: env.SMTP_HOST, port: env.SMTP_PORT, secure: env.SMTP_PORT === 465,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  }));

export const sendEmail = async (to: string, subject: string, text: string, html?: string | null) => {
  if (!env.SMTP_HOST) {
    if (isProd) throw new Error('SMTP is not configured');
    logger.info({ to, subject, text }, '[dev] email not sent (SMTP not configured)');
    return;
  }
  await get().sendMail({ from: env.MAIL_FROM, to, subject, text, html: html ?? undefined });
};