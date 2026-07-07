/**
 * Payment provider seam. Every caller goes through paymentProvider() — the
 * same interface a real Stripe integration uses — so going live is a
 * key-paste (the real provider in src/lib/providers/stripe.ts is already
 * implemented). No route or page knows whether it is talking to the stub.
 *
 * Webhook signature verification is REAL in both modes (spec: signature-
 * verified payment confirmation is the only trusted "paid" signal). In stub
 * mode the simulated webhook is signed with the same secret, so the
 * verification code path is exercised end-to-end.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import { envVar, realEnv, stubMode } from './env';
import { stripeStub } from './stubs/stripe';
import { stripeReal } from './providers/stripe';

/**
 * The webhook-secret used to verify Stripe signatures. In LIVE mode it MUST
 * be a real `whsec_…` secret — a placeholder fails closed (verification
 * returns false, so no payment is ever trusted) rather than accepting
 * signatures forged with the publicly committed .env.example placeholder. In
 * stub mode the loopback simulator and the verifier share whatever secret is
 * set, so the signed-webhook trust path still runs end-to-end.
 */
function webhookSecret(): string | undefined {
  return stubMode.stripe
    ? envVar('STRIPE_WEBHOOK_SECRET')
    : realEnv('STRIPE_WEBHOOK_SECRET');
}

export interface CreateOrderInput {
  bookingId: string;
  /** Smallest currency unit (cents for USD, paise for INR). */
  amountMinor: number;
  /** ISO currency code, e.g. 'USD'. */
  currency: string;
  description?: string;
  /** Where Stripe returns the buyer after Checkout (real mode). */
  successUrl?: string;
  cancelUrl?: string;
}

export interface PaymentOrder {
  /** Stripe Checkout Session id (`cs_…`), or `cs_stub_…` from the stub. */
  orderId: string;
  amountMinor: number;
  currency: string;
  /** Stripe-hosted Checkout URL to redirect to (real mode only). */
  checkoutUrl?: string;
  /** true when produced by the stub — surfaced to the UI so it can say so. */
  stub: boolean;
}

export interface PaymentProvider {
  readonly name: string;
  readonly isStub: boolean;
  createOrder(input: CreateOrderInput): Promise<PaymentOrder>;
}

export function paymentProvider(): PaymentProvider {
  // STUB SELECTION: while STRIPE_SECRET_KEY is absent or still the template
  // placeholder, the stub is used. Set a real key to switch.
  return stubMode.stripe ? stripeStub : stripeReal;
}

/**
 * Stripe webhook signature verification. Stripe sends a `Stripe-Signature`
 * header of the form `t=<unix>,v1=<hex-hmac>[,v1=…]`. The signed payload is
 * `<t>.<rawBody>`, HMAC-SHA256 with the endpoint's `whsec_…` secret. We reject
 * stale timestamps (replay protection) and compare constant-time against every
 * v1 candidate. This exact code verifies real Stripe webhooks once the real
 * secret is set — nothing to swap.
 */
const SIGNATURE_TOLERANCE_SECONDS = 5 * 60;

export function verifyStripeWebhookSignature(
  rawBody: string,
  header: string | null,
  nowSeconds: number = Math.floor(Date.now() / 1000)
): boolean {
  const secret = webhookSecret();
  if (!secret || !header) return false;

  let timestamp = '';
  const v1: string[] = [];
  for (const part of header.split(',')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim();
    const value = part.slice(eq + 1).trim();
    if (key === 't') timestamp = value;
    else if (key === 'v1') v1.push(value);
  }
  if (!timestamp || v1.length === 0) return false;

  const ts = Number.parseInt(timestamp, 10);
  if (!Number.isFinite(ts) || Math.abs(nowSeconds - ts) > SIGNATURE_TOLERANCE_SECONDS) {
    return false;
  }

  const expected = createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex');
  const a = Buffer.from(expected, 'utf8');
  return v1.some((candidate) => {
    const b = Buffer.from(candidate, 'utf8');
    return a.length === b.length && timingSafeEqual(a, b);
  });
}

/** Used by the stub-only simulator to produce a valid Stripe-Signature header. */
export function signStripeWebhookPayload(
  rawBody: string,
  timestampSeconds: number = Math.floor(Date.now() / 1000)
): string | null {
  const secret = webhookSecret();
  if (!secret) return null;
  const sig = createHmac('sha256', secret)
    .update(`${timestampSeconds}.${rawBody}`)
    .digest('hex');
  return `t=${timestampSeconds},v1=${sig}`;
}
