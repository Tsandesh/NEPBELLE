import { formatCurrency } from '@/utils/format';

/** 0412 345 678 -> 61412345678 (the format wa.me needs). Assumes Australian numbers when there's no country code. */
export const toWaNumber = (raw: string) => {
  let d = raw.replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('0')) d = `61${d.slice(1)}`;
  return d;
};

interface O { customerName: string; orderNumber: string; status: string; totalCents: number; paymentMethod: string; paymentStatus: string; courier?: string | null; trackingNumber?: string | null }

export const waMessage = (o: O) => {
  const hi = `Hi ${o.customerName.split(' ')[0]}, `;
  const tail = ' Thanks for shopping with Nepbelle!';
  switch (o.status) {
    case 'PLACED': return `${hi}we’ve received your order ${o.orderNumber} (${formatCurrency(o.totalCents)}).${tail}`;
    case 'CONFIRMED': return `${hi}your order ${o.orderNumber} is confirmed.${tail}`;
    case 'PACKED': return `${hi}your order ${o.orderNumber} is packed and will be sent soon.${tail}`;
    case 'OUT_FOR_DELIVERY':
      return `${hi}your order ${o.orderNumber} is on its way.${o.courier ? ` Courier: ${o.courier}.` : ''}${o.trackingNumber ? ` Tracking: ${o.trackingNumber}.` : ''}${o.paymentMethod === 'COD' && o.paymentStatus === 'UNPAID' ? ` Please have ${formatCurrency(o.totalCents)} in cash ready.` : ''}`;
    case 'DELIVERED': return `${hi}your order ${o.orderNumber} has been delivered.${tail}`;
    case 'CANCELLED': return `${hi}your order ${o.orderNumber} has been cancelled.`;
    default: return `${hi}an update on your order ${o.orderNumber}.`;
  }
};

export const waLink = (phone: string, text: string) => `https://wa.me/${toWaNumber(phone)}?text=${encodeURIComponent(text)}`;