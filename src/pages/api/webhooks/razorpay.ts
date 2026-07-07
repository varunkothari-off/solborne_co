/**
 * POST /api/webhooks/razorpay — signature-verified payment confirmation.
 * THE ONLY TRUSTED "PAID" SIGNAL (spec non-negotiable): the HMAC-SHA256
 * signature over the raw body is verified BEFORE anything else happens; a
 * client-side redirect is never treated as proof of payment.
 *
 * On a verified payment.captured event the booking is marked paid. That is
 * ALL this route does now: under the flow spec (2026-07-08) payment unlocks
 * the screening PACKAGE, and the member schedules their calls from the
 * dashboard — nothing is auto-dialled on capture. (Ops can still fire a call
 * for a paid booking via the internal POST /api/calls/trigger.)
 */
import type { APIRoute } from 'astro';
import { verifyRazorpayWebhookSignature } from '../../../lib/payments';
import { internalRpc } from '../../../lib/supabase';
import { json, errorResponse } from '../../../lib/api';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const rawBody = await request.text();
  if (rawBody.length > 64_000) return json({ error: 'payload too large' }, 413);

  const signature = request.headers.get('x-razorpay-signature');
  if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
    return json({ error: 'invalid signature' }, 401);
  }

  let event: {
    event?: string;
    payload?: { payment?: { entity?: { id?: string; order_id?: string } } };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return json({ error: 'invalid JSON' }, 400);
  }

  if (event.event !== 'payment.captured') {
    // Acknowledge unhandled events so Razorpay does not retry them forever.
    return json({ ok: true, ignored: event.event ?? 'unknown' });
  }

  const payment = event.payload?.payment?.entity;
  if (!payment?.order_id || !payment.id) {
    return json({ error: 'malformed payment payload' }, 400);
  }

  try {
    const result = await internalRpc<{
      booking_id: string;
      already_captured: boolean;
    }>('record_payment_captured', {
      p_order_id: payment.order_id,
      p_payment_id: payment.id,
      p_raw: event,
    });

    // Capture only. No call is placed here — the member schedules from the
    // dashboard once the package is active.
    return json({
      ok: true,
      booking_id: result.booking_id,
      already_captured: result.already_captured,
    });
  } catch (err) {
    return errorResponse(err);
  }
};
