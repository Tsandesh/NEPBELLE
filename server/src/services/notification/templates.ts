import type { Prisma } from '@prisma/client';
import { env } from '../../config/env.js';
import { esc } from '../../utils/escape.js';
import { formatCurrency as money } from '../../utils/format.js';

export type MailOrder = Prisma.OrderGetPayload<{ include: { items: true } }>;
export type AdminEvent = 'ADMIN_NEW_ORDER' | 'ADMIN_PROOF_RESUBMITTED' | 'ADMIN_EXCHANGE_REQUEST';
export type CustomerEvent =
  | 'CUSTOMER_ORDER_RECEIVED' | 'CUSTOMER_CONFIRMED' | 'CUSTOMER_OUT_FOR_DELIVERY' | 'CUSTOMER_DELIVERED'
  | 'CUSTOMER_CANCELLED' | 'CUSTOMER_PAYMENT_REJECTED' | 'CUSTOMER_EXCHANGE_REQUESTED' | 'CUSTOMER_EXCHANGED' | 'CUSTOMER_EXCHANGE_DECLINED';
export type NotifyEvent = AdminEvent | CustomerEvent;
export interface Extra { reason?: string }

/** Switch a customer email off by setting it to false. */
export const CUSTOMER_EMAILS: Record<CustomerEvent, boolean> = {
  CUSTOMER_ORDER_RECEIVED: true,
  CUSTOMER_CONFIRMED: true,
  CUSTOMER_OUT_FOR_DELIVERY: true,
  CUSTOMER_DELIVERED: true,
  CUSTOMER_CANCELLED: true,
  CUSTOMER_PAYMENT_REJECTED: true,
  CUSTOMER_EXCHANGE_REQUESTED: true,
  CUSTOMER_EXCHANGED: true,
  CUSTOMER_EXCHANGE_DECLINED: true,
};

interface Copy { subject: string; heading: string; paragraphs: string[]; cta?: { label: string; url: string } }

const first = (o: MailOrder) => o.customerName.split(' ')[0] || 'there';
const addr = (o: MailOrder) => {
  const a = o.shippingAddress as Record<string, string>;
  return [a.fullName, a.line1, a.line2, `${a.city} ${a.state} ${a.postcode}`].filter(Boolean).join(', ');
};
const track = (o: MailOrder) => ({ label: 'View your order', url: `${env.CLIENT_ORIGIN}/orders/${o.id}/tracking` });
const adminLink = (o: MailOrder) => ({ label: 'Open order', url: `${env.CLIENT_ORIGIN}/admin/orders/${o.id}` });
const method = (o: MailOrder) => (o.paymentMethod === 'PAYID' ? 'PayID' : 'Cash on delivery');
const itemsLine = (o: MailOrder) => o.items.map((i) => `${i.quantity}x ${i.productName} (${i.size}, ${i.colourName})`).join('; ');

const CUSTOMER: Record<CustomerEvent, (o: MailOrder, x: Extra) => Copy> = {
  CUSTOMER_ORDER_RECEIVED: (o) => ({
    subject: `We’ve received your order ${o.orderNumber}`, heading: 'Thanks, we’ve received your order', cta: track(o),
    paragraphs: [
      `Hi ${first(o)}, your order ${o.orderNumber} for ${money(o.totalCents)} is with us.`,
      o.paymentMethod === 'PAYID'
        ? 'We’re checking your PayID payment now. You’ll get another email as soon as it’s confirmed.'
        : `You chose cash on delivery. Please have ${money(o.totalCents)} ready when it arrives.`,
    ],
  }),
  CUSTOMER_CONFIRMED: (o) => ({
    subject: `Order ${o.orderNumber} confirmed`, heading: 'Your order is confirmed', cta: track(o),
    paragraphs: [`Hi ${first(o)}, ${o.paymentMethod === 'PAYID' ? 'we’ve verified your payment and ' : ''}your order ${o.orderNumber} is confirmed. We’ll email you again when it’s on its way.`],
  }),
  CUSTOMER_OUT_FOR_DELIVERY: (o) => ({
    subject: `Your order ${o.orderNumber} is on its way`, heading: 'Your order is out for delivery', cta: track(o),
    paragraphs: [
      `Hi ${first(o)}, your order ${o.orderNumber} is on its way to ${addr(o)}.`,
      ...(o.courier || o.trackingNumber ? [`Courier: ${o.courier ?? 'n/a'}${o.trackingNumber ? ` · Tracking number: ${o.trackingNumber}` : ''}`] : []),
      ...(o.paymentMethod === 'COD' && o.paymentStatus !== 'PAID' ? [`Please have ${money(o.totalCents)} in cash ready on delivery.`] : []),
    ],
  }),
  CUSTOMER_DELIVERED: (o) => ({
    subject: `Order ${o.orderNumber} delivered`, heading: 'Your order has been delivered', cta: track(o),
    paragraphs: [
      `Hi ${first(o)}, your order ${o.orderNumber} has been delivered. We hope you love it!`,
      ...(env.EXCHANGE_WINDOW_DAYS > 0 ? [`Need a different size? You can request an exchange from your order page within ${env.EXCHANGE_WINDOW_DAYS} days.`] : []),
    ],
  }),
  CUSTOMER_CANCELLED: (o, x) => ({
    subject: `Order ${o.orderNumber} cancelled`, heading: 'Your order was cancelled', cta: track(o),
    paragraphs: [
      `Hi ${first(o)}, your order ${o.orderNumber} has been cancelled.`,
      `Reason: ${x.reason ?? o.cancelReason ?? 'not provided'}`,
      ...(o.paymentStatus === 'REFUND_DUE' ? ['Because you had paid by PayID, we’ll send your refund to your bank shortly.'] : []),
    ],
  }),
  CUSTOMER_PAYMENT_REJECTED: (o, x) => ({
    subject: `Action needed: we couldn’t verify payment for ${o.orderNumber}`, heading: 'We couldn’t verify your payment', cta: { label: 'Upload a new screenshot', url: track(o).url },
    paragraphs: [
      `Hi ${first(o)}, we couldn’t match a PayID payment to order ${o.orderNumber}.`,
      `Reason: ${x.reason ?? o.paymentNote ?? 'no matching payment found'}`,
      'Please upload a clear screenshot of the successful payment from your banking app. If you haven’t paid yet, please pay and then upload it.',
    ],
  }),
  CUSTOMER_EXCHANGE_REQUESTED: (o) => ({
    subject: `Exchange request received for ${o.orderNumber}`, heading: 'We’ve received your exchange request', cta: track(o),
    paragraphs: [`Hi ${first(o)}, we’ve received your exchange request for order ${o.orderNumber} and will be in touch soon.`],
  }),
  CUSTOMER_EXCHANGED: (o) => ({
    subject: `Exchange completed for ${o.orderNumber}`, heading: 'Your exchange is complete', cta: track(o),
    paragraphs: [`Hi ${first(o)}, your exchange for order ${o.orderNumber} has been completed.`],
  }),
  CUSTOMER_EXCHANGE_DECLINED: (o, x) => ({
    subject: `Update on your exchange request for ${o.orderNumber}`, heading: 'About your exchange request', cta: track(o),
    paragraphs: [`Hi ${first(o)}, we’re unable to exchange items from order ${o.orderNumber}.`, `Reason: ${x.reason ?? 'not provided'}`],
  }),
};

const ADMIN: Record<AdminEvent, (o: MailOrder, x: Extra) => Copy> = {
  ADMIN_NEW_ORDER: (o) => ({
    subject: `New order ${o.orderNumber} · ${money(o.totalCents)} · ${method(o)}`, heading: 'New order request', cta: adminLink(o),
    paragraphs: [
      `Customer: ${o.customerName} · ${o.phone} · ${o.email}`,
      `Items: ${itemsLine(o)}`,
      `Total: ${money(o.totalCents)} · ${method(o)}${o.paymentMethod === 'PAYID' ? ' (check the screenshot AND your bank app before verifying)' : ''}`,
      ...(o.payidReceiptNumber ? [`PayID receipt number given: ${o.payidReceiptNumber}`] : []),
      `Ship to: ${addr(o)}`,
    ],
  }),
  ADMIN_PROOF_RESUBMITTED: (o) => ({
    subject: `New payment screenshot for ${o.orderNumber}`, heading: 'Customer re-uploaded payment proof', cta: adminLink(o),
    paragraphs: [`${o.customerName} uploaded a new screenshot for ${o.orderNumber} (${money(o.totalCents)}).`, ...(o.payidReceiptNumber ? [`Receipt number: ${o.payidReceiptNumber}`] : [])],
  }),
  ADMIN_EXCHANGE_REQUEST: (o, x) => ({
    subject: `Exchange request for ${o.orderNumber}`, heading: 'Exchange requested', cta: adminLink(o),
    paragraphs: [`${o.customerName} (${o.phone}) wants an exchange for ${o.orderNumber}.`, `Reason: ${x.reason ?? 'not provided'}`],
  }),
};

const itemsHtml = (o: MailOrder) =>
  `<table width="100%" cellpadding="6" cellspacing="0" style="border-collapse:collapse;margin:16px 0;font-size:14px">${o.items
    .map((i) => `<tr><td style="border-bottom:1px solid #eee">${esc(i.productName)}<br><span style="color:#666;font-size:12px">Size ${esc(i.size)} · ${esc(i.colourName)} · Qty ${i.quantity}</span></td><td align="right" style="border-bottom:1px solid #eee">${money(i.unitPriceCents * i.quantity)}</td></tr>`)
    .join('')}<tr><td align="right" style="color:#666">Shipping</td><td align="right">${o.shippingCents ? money(o.shippingCents) : 'Free'}</td></tr><tr><td align="right"><b>Total</b></td><td align="right"><b>${money(o.totalCents)}</b></td></tr></table>`;

const layout = (title: string, body: string) => `<!doctype html><html><body style="margin:0;background:#faf7f5;font-family:Arial,Helvetica,sans-serif;color:#222"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px"><table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border:1px solid #e5e5e5"><tr><td style="background:#a72f30;color:#fff;padding:18px 24px;font-size:20px;letter-spacing:3px;font-weight:bold">${esc(env.STORE_NAME).toUpperCase()}</td></tr><tr><td style="padding:24px"><h1 style="font-size:20px;margin:0 0 12px">${esc(title)}</h1>${body}</td></tr></table></td></tr></table></body></html>`;

const render = (c: Copy, o: MailOrder) => ({
  subject: c.subject,
  text: [c.heading, '', ...c.paragraphs, '', `Order ${o.orderNumber}: ${itemsLine(o)}`, `Total: ${money(o.totalCents)}`, ...(c.cta ? ['', `${c.cta.label}: ${c.cta.url}`] : [])].join('\n'),
  html: layout(c.heading,
    c.paragraphs.map((p) => `<p style="margin:0 0 12px;line-height:1.5">${esc(p)}</p>`).join('') + itemsHtml(o) +
    (c.cta ? `<p><a href="${esc(c.cta.url)}" style="display:inline-block;background:#b51f2a;color:#fff;text-decoration:none;padding:12px 20px;font-weight:bold">${esc(c.cta.label)}</a></p>` : '')),
});

export const renderCustomer = (ev: CustomerEvent, o: MailOrder, x: Extra = {}) => render(CUSTOMER[ev](o, x), o);
export const renderAdmin = (ev: AdminEvent, o: MailOrder, x: Extra = {}) => render(ADMIN[ev](o, x), o);