import { env } from "../../config/env.js";



const call = async (path: string, body: unknown) => {
  const res = await fetch(`https://api.brevo.com/v3${path}`, {
    method: 'POST',
    headers: { 'api-key': env.BREVO_API_KEY ?? "no-key", 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`Brevo ${path} ${res.status}: ${(await res.text()).slice(0, 300)}`);
};

export const sendEmail = (to: string, subject: string, text: string, html?: string | null) =>
  call('/smtp/email', {
    sender: { email: env.BREVO_SENDER_EMAIL, name: env.STORE_NAME },
    to: [{ email: to }],
    subject,
    textContent: text,
    ...(html ? { htmlContent: html } : {}),
  });

/** AU mobiles: 04xx xxx xxx -> 614xxxxxxxx. Anything else must already include a country code. */
export const toE164 = (raw: string) => {
  const d = raw.replace(/[^\d+]/g, '');
  if (d.startsWith('+')) return d.slice(1);
  if (d.startsWith('00')) return d.slice(2);
  if (d.startsWith('0')) return `61${d.slice(1)}`;
  return d;
};

export const sendSms = (to: string, content: string) =>
  call('/transactionalSMS/sms', {
    sender: env.BREVO_SMS_SENDER,
    recipient: toE164(to),
    content,
    type: 'transactional',
  });