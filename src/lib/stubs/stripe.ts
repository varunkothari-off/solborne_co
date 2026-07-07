/**
 * // STUB: replaced by the real Stripe call once STRIPE_SECRET_KEY is set in
 * // .env — see docs/wiring-checklist.md. Makes NO network calls of any kind.
 *
 * Simulates a Stripe Checkout Session with a `cs_stub_…` id (the same shape
 * the real provider returns, so the webhook capture path is identical).
 * Selected automatically by paymentProvider() while STRIPE_SECRET_KEY is
 * absent or a placeholder. Stub orders have no checkoutUrl — the dashboard
 * shows the simulate button instead of redirecting to Stripe.
 */
import type { CreateOrderInput, PaymentOrder, PaymentProvider } from '../payments';

export const stripeStub: PaymentProvider = {
  name: 'stripe-stub',
  isStub: true,

  // STUB: replace with real call once STRIPE_SECRET_KEY is set. The real
  // implementation lives in src/lib/providers/stripe.ts.
  async createOrder(input: CreateOrderInput): Promise<PaymentOrder> {
    return {
      orderId: `cs_stub_${crypto.randomUUID().replaceAll('-', '').slice(0, 20)}`,
      amountMinor: input.amountMinor,
      currency: input.currency,
      stub: true,
    };
  },
};
