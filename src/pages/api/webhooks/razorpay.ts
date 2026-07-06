/**
 * POST /api/webhooks/razorpay — signature-verified payment confirmation.
 * THE ONLY TRUSTED "PAID" SIGNAL (spec non-negotiable): the HMAC-SHA256
 * signature over the raw body is verified BEFORE anything else happens; a
 * client-side redirect is never treated as proof of payment.
 *
 * On a verified payment.captured event the booking is marked paid and the
 * discovery call is triggered (through the voice provider seam — the
 * ElevenLabs stub until real keys exist and the release-gate test call has
 * been run).
 */
import type { APIRoute } from 'astro';
import { verifyRazorpayWebhookSignature } from '../../../lib/payments';
import { internalRpc } from '../../../lib/supabase';
import { triggerCallForBooking } from '../../../lib/onboarding';
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

    // Fire the discovery call only after the verified capture, and only once.
    let call: { callId: string; stub: boolean } | null = null;
    if (!result.already_captured) {
      try {
        const triggered = await triggerCallForBooking(result.booking_id);
        call = { callId: triggered.callId, stub: triggered.stub };
      } catch (callErr) {
        // The payment IS captured; a call-trigger failure must not make
        // Razorpay retry the webhook. Log and let ops re-trigger via
        // POST /api/calls/trigger.
        console.error('[webhook] call trigger failed:', callErr);
      }
    }

    return json({ ok: true, booking_id: result.booking_id, call });
  } catch (err) {
    return errorResponse(err);
  }
};
