/**
 * Payment boundary. ASSUMPTION: no gateway is specified in the brief/design.
 * Replace `charge` with Stripe PaymentIntents (or similar); never accept raw card numbers here.
 */
export const paymentService = {
  async charge(_input: { amountCents: number; method: 'card' | 'cod'; orderNumber: string }) {
    return { status: _input.method === 'cod' ? 'PENDING' : 'PAID' } as const;
  },
};
