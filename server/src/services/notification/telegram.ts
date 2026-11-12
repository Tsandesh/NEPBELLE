import { env } from '../../config/env.js';

export const telegramEnabled = () => !!(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID);

export const sendTelegram = async (text: string) => {
  const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: text.slice(0, 4000), disable_web_page_preview: true }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Telegram responded ${res.status}`); // never include the URL: it contains the bot token
};