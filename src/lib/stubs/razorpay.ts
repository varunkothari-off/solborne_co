/**
 * // STUB: replace with real call once RAZORPAY_KEY_ID and
 * // RAZORPAY_KEY_SECRET are set in .env — see docs/wiring-checklist.md.
 *
 * Simulates Razorpay's Orders API with a success response. Makes NO network
 * calls of any kind. Selected automatically by paymentProvider() while the
 * Razorpay env vars are absent or placeholders.
 */
import type { CreateOrderInput, PaymentOrder, PaymentProvider } from '../payments';

export const razorpayStub: PaymentProvider = {
  name: 'razorpay-stub',
  isStub: true,

  // STUB: replace with real call once RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET
  // are set. The real implementation lives in src/lib/providers/razorpay.ts.
  async createOrder(input: CreateOrderInput): Promise<PaymentOrder> {
    return {
      orderId: `order_stub_${crypto.randomUUID().replaceAll('-', '').slice(0, 14)}`,
      amountPaise: input.amountPaise,
      currency: input.currency,
      stub: true,
    };
  },
};
