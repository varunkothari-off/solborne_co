/**
 * REAL Razorpay integration — intentionally NOT implemented yet: no real key
 * exists, and no live Razorpay call may be made until one does.
 *
 * When RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET hold real values,
 * paymentProvider() selects THIS module. Implement createOrder() below
 * (reference implementation in the comment), following
 * docs/wiring-checklist.md. Until implemented it fails loudly rather than
 * pretending.
 */
import type { CreateOrderInput, PaymentOrder, PaymentProvider } from '../payments';

export const razorpayReal: PaymentProvider = {
  name: 'razorpay',
  isStub: false,

  async createOrder(_input: CreateOrderInput): Promise<PaymentOrder> {
    throw new Error(
      'Real Razorpay keys are set but the real provider is not implemented yet — ' +
        'complete src/lib/providers/razorpay.ts (see docs/wiring-checklist.md).'
    );
    /* Reference implementation (verify against current Razorpay docs first):
    const keyId = requireEnv('RAZORPAY_KEY_ID');
    const keySecret = requireEnv('RAZORPAY_KEY_SECRET');
    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: _input.amountPaise,          // paise
        currency: _input.currency,           // 'INR'
        receipt: `booking_${_input.bookingId}`,
        notes: { booking_id: _input.bookingId },
      }),
    });
    if (!res.ok) throw new Error(`Razorpay order creation failed: ${res.status}`);
    const order = await res.json();
    return { orderId: order.id, amountPaise: order.amount, currency: order.currency, stub: false };
    */
  },
};
