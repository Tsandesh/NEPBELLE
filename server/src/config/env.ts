import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(7),

  STORE_NAME: z.string().default('Nepbelle'),
  PAYID_VALUE: z.string().min(1),
  PAYID_ACCOUNT_NAME: z.string().min(1),
  COD_MAX_TOTAL_CENTS: z.coerce.number().int().min(0).default(0),
  EXCHANGE_WINDOW_DAYS: z.coerce.number().int().min(0).default(7),
  ADMIN_NOTIFY_EMAIL: z.string().email(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().default('Nepbelle <no-reply@localhost>'),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_CHAT_ID: z.string().optional(),
BREVO_API_KEY: z.string().optional(),
BREVO_SENDER_EMAIL: z.string().email().optional(),
BREVO_SMS_SENDER: z.string().optional(),
  
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment variables', parsed.error.flatten().fieldErrors);
  process.exit(1);
}
export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
