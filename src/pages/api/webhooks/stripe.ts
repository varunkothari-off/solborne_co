/**
 * POST /api/webhooks/stripe — signature-verified payment confirmation.
 * THE ONLY TRUSTED "PAID" SIGNAL: the Stripe-Signature header is verified over
 * the raw body BEFORE anything else happens; the success redirect is never
 * treated as proof of payment.
 *
 * On a verified `checkout.session.completed` (payment_status = paid) the
 * booking is marked paid. That is ALL this route does: payment unlocks the
 * screening PACKAGE, and the member schedules their calls from the dashboard
 * — nothing is auto-dialled on capture.
 */
import type { APIRoute } from 'astro';
import { verifyStripeWebhookSignature } from '../../../lib/payments';
import { internalRpc } from '../../../lib/supabase';
import { json, errorResponse } from '../../../lib/api';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const rawBody = await request.text();
  if (rawBody.length > 256_000) return json({ error: 'payload too large' }, 413);

  const signature = request.headers.get('stripe-signature');
  if (!verifyStripeWebhookSignature(rawBody, signature)) {
    return json({ error: 'invalid signature' }, 401);
  }

  let event: {
    type?: string;
    data?: {
      object?: {
        id?: string;
        payment_status?: string;
        payment_intent?: string | { id?: string };
      };
    };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return json({ error: 'invalid JSON' }, 400);
  }

  // Acknowledge unhandled events so Stripe stops retrying them.
  if (event.type !== 'checkout.session.completed') {
    return json({ ok: true, ignored: event.type ?? 'unknown' });
  }

  const session = event.data?.object;
  const orderId = session?.id;
  // Only a session Stripe itself marks paid is trusted.
  if (!orderId || session?.payment_status !== 'paid') {
    return json({ ok: true, ignored: 'unpaid_or_malformed' });
  }
  const paymentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id ?? orderId;

  try {
    const result = await internalRpc<{
      booking_id: string;
      already_captured: boolean;
    }>('record_payment_captured', {
      p_order_id: orderId,
      p_payment_id: paymentId,
      p_raw: event,
    });

    return json({
      ok: true,
      booking_id: result.booking_id,
      already_captured: result.already_captured,
    });
  } catch (err) {
    return errorResponse(err);
  }
};
