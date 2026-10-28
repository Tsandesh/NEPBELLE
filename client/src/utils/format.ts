export const formatCurrency = (cents: number) => `AU$${(cents / 100).toFixed(2)}`;
export const formatDate = (d: string | Date) =>
  new Intl.DateTimeFormat('en-AU', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d));
