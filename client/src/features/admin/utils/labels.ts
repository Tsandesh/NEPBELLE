export const STATUS_LABEL: Record<string, string> = {
  PLACED: 'Placed', CONFIRMED: 'Confirmed', PACKED: 'Packed', OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered', CANCELLED: 'Cancelled', EXCHANGE_REQUESTED: 'Exchange requested', EXCHANGED: 'Exchanged',
};
export const PAYMENT_LABEL: Record<string, string> = {
  UNPAID: 'Unpaid', PROOF_SUBMITTED: 'Check payment', PAID: 'Paid', REJECTED: 'Rejected', REFUND_DUE: 'Refund due', REFUNDED: 'Refunded',
};
export const STATUS_TONE: Record<string, string> = {
  PLACED: 'bg-amber-100 text-amber-800', CONFIRMED: 'bg-blue-100 text-blue-800', PACKED: 'bg-indigo-100 text-indigo-800',
  OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-800', DELIVERED: 'bg-green-100 text-green-800', CANCELLED: 'bg-red-100 text-red-800',
  EXCHANGE_REQUESTED: 'bg-orange-100 text-orange-800', EXCHANGED: 'bg-teal-100 text-teal-800',
  UNPAID: 'bg-gray-100 text-gray-700', PROOF_SUBMITTED: 'bg-amber-100 text-amber-800', PAID: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800', REFUND_DUE: 'bg-orange-100 text-orange-800', REFUNDED: 'bg-gray-100 text-gray-700',
};