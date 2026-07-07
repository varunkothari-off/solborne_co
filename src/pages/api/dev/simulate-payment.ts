/**
 * POST /api/dev/simulate-payment — STUB-ONLY payment simulator.
 *
 * // STUB: delete this route (or leave it — it self-disables) once real
 * // STRIPE keys are set. See docs/wiring-checklist.md.
 *
 * Stands in for Stripe's servers during stub-mode testing: builds a realistic
 * `checkout.session.completed` event for the given order, signs it with
 * STRIPE_WEBHOOK_SECRET using the SAME Stripe-Signature scheme the real
 * webhook verifies, and POSTs it to our own /api/webhooks/stripe — so the
 * signature-verification trust path is exercised end-to-end, not bypassed.
 *
 * HARD-DISABLED the moment a real Stripe key exists: it then returns 403
 * unconditionally, so it can never fabricate a "paid" state alongside real
 * money movement.
 *
 * Body: { order_id: string }
 */
import type { APIRoute } from 'astro';
import { stubMode } from '../../../lib/env';
import { signStripeWebhookPayload } from '../../../lib/payments';
import { json, readJson } from '../../../lib/api';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!stubMode.stripe) {
    return json({ error: 'disabled: real Stripe keys are configured' }, 403);
  }

  const body = (await readJson(request)) as { order_id?: string } | null;
  if (!body?.order_id || typeof body.order_id !== 'string') {
    return json({ error: 'order_id required' }, 400);
  }
  if (!body.order_id.startsWith('cs_stub_')) {
    return json({ error: 'only stub orders can be simulated' }, 400);
  }

  const event = {
    id: `evt_stub_${crypto.randomUUID().replaceAll('-', '').slice(0, 16)}`,
    object: 'event',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: body.order_id,
        object: 'checkout.session',
        payment_status: 'paid',
        payment_intent: `pi_stub_${crypto.randomUUID().replaceAll('-', '').slice(0, 16)}`,
      },
    },
    created: Math.floor(Date.now() / 1000),
  };
  const rawBody = JSON.stringify(event);
  const signature = signStripeWebhookPayload(rawBody);
  if (!signature) {
    return json({ error: 'STRIPE_WEBHOOK_SECRET is unset' }, 500);
  }

  // Loop back into our own webhook so the verified path runs for real.
  const webhookUrl = new URL('/api/webhooks/stripe', request.url);
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'stripe-signature': signature,
    },
    body: rawBody,
  });
  const webhookResult = await res.json().catch(() => null);
  return json(
    { simulated: true, webhook_status: res.status, webhook: webhookResult },
    res.ok ? 200 : 502
  );
};
