/**
 * Payment provider seam. Every caller goes through paymentProvider() — the
 * same interface a real Razorpay integration uses — so going live is a
 * key-paste plus implementing src/lib/providers/razorpay.ts. No route or
 * page knows whether it is talking to the stub.
 *
 * Webhook signature verification is REAL HMAC in both modes (spec:
 * signature-verified payment confirmation is the only trusted "paid"
 * signal). In stub mode the simulated webhook is signed with the same
 * placeholder secret, so the verification code path is exercised end-to-end.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import { envVar, realEnv, stubMode } from './env';
import { razorpayStub } from './stubs/razorpay';
import { razorpayReal } from './providers/razorpay';

/**
 * The webhook-secret used for HMAC. In LIVE mode it MUST be a real secret —
 * a placeholder fails closed (verification returns false, so no payment is
 * ever trusted) rather than accepting signatures forged with the publicly
 * committed .env.example placeholder. In stub mode the loopback simulator and
 * the verifier share whatever secret is set, so the signed-webhook trust path
 * still runs end-to-end even before a real secret exists.
 */
function webhookSecret(): string | undefined {
  return stubMode.razorpay
    ? envVar('RAZORPAY_WEBHOOK_SECRET')
    : realEnv('RAZORPAY_WEBHOOK_SECRET');
}

export interface CreateOrderInput {
  bookingId: string;
  amountPaise: number;
  currency: string;
}

export interface PaymentOrder {
  orderId: string;
  amountPaise: number;
  currency: string;
  /** true when produced by the stub — surfaced to the UI so it can say so. */
  stub: boolean;
}

export interface PaymentProvider {
  readonly name: string;
  readonly isStub: boolean;
  createOrder(input: CreateOrderInput): Promise<PaymentOrder>;
}

export function paymentProvider(): PaymentProvider {
  // STUB SELECTION: while RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are absent or
  // still template placeholders, the stub is used. Set real keys to switch.
  return stubMode.razorpay ? razorpayStub : razorpayReal;
}

/**
 * Razorpay webhook signature check: HMAC-SHA256 hex of the RAW request body
 * keyed with RAZORPAY_WEBHOOK_SECRET, compared constant-time against the
 * x-razorpay-signature header. This exact code verifies real Razorpay
 * webhooks once the real secret is set — nothing to swap.
 */
export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string | null
): boolean {
  const secret = webhookSecret();
  if (!secret || !signature) return false;
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(signature, 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Used by the stub-only payment simulator to produce a valid signature. */
export function signRazorpayWebhookBody(rawBody: string): string | null {
  const secret = webhookSecret();
  if (!secret) return null;
  return createHmac('sha256', secret).update(rawBody).digest('hex');
}
