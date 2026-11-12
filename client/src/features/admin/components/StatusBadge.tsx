import { PAYMENT_LABEL, STATUS_LABEL, STATUS_TONE } from '../utils/labels';

export const StatusBadge = ({ value, kind = 'status' }: { value: string; kind?: 'status' | 'payment' }) => (
  <span className={`inline-block whitespace-nowrap px-2 py-1 text-2xs font-semibold ${STATUS_TONE[value] ?? 'bg-gray-100'}`}>
    {(kind === 'payment' ? PAYMENT_LABEL : STATUS_LABEL)[value] ?? value}
  </span>
);