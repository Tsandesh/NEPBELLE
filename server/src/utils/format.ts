/** Design shows prices as "AU$271.00". Amounts are stored as integer cents. */
export const formatCurrency = (cents: number, currency = 'AUD') =>
  `${currency === 'AUD' ? 'AU$' : currency + ' '}${(cents / 100).toFixed(2)}`;

export const formatDate = (d: Date | string) =>
  new Intl.DateTimeFormat('en-AU', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d));

export const generateOrderNumber = () =>
  `NB${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
