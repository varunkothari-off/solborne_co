/**
 * POST /api/dev/simulate-payment — STUB-ONLY payment simulator.
 *
 * // STUB: delete this route (or leave it — it self-disables) once real
 * // RAZORPAY keys are set. See docs/wiring-checklist.md.
 *
 * Stands in for Razorpay's servers during stub-mode testing: builds a
 * realistic payment.captured event for the given order, signs it with
 * RAZORPAY_WEBHOOK_SECRET using the SAME HMAC the real webhook uses, and
 * POSTs it to our own /api/webhooks/razorpay — so the signature-verification
 * trust path is exercised end-to-end, not bypassed.
 *
 * HARD-DISABLED the moment real Razorpay keys exist: with real keys this
 * endpoint returns 403 unconditionally, so it can never fabricate a "paid"
 * state alongside real money movement.
 *
 * Body: { order_id: string }
 */
import type { APIRoute } from 'astro';
import { stubMode } from '../../../lib/env';
import { signRazorpayWebhookBody } from '../../../lib/payments';
import { json, readJson } from '../../../lib/api';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!stubMode.razorpay) {
    return json(
      { error: 'disabled: real Razorpay keys are configured' },
      403
    );
  }

  const body = (await readJson(request)) as { order_id?: string } | null;
  if (!body?.order_id || typeof body.order_id !== 'string') {
    return json({ error: 'order_id required' }, 400);
  }
  if (!body.order_id.startsWith('order_stub_')) {
    return json({ error: 'only stub orders can be simulated' }, 400);
  }

  const event = {
    entity: 'event',
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: `pay_stub_${crypto.randomUUID().replaceAll('-', '').slice(0, 14)}`,
          order_id: body.order_id,
          status: 'captured',
          method: 'stub',
        },
      },
    },
    created_at: Math.floor(Date.now() / 1000),
  };
  const rawBody = JSON.stringify(event);
  const signature = signRazorpayWebhookBody(rawBody);
  if (!signature) {
    return json({ error: 'RAZORPAY_WEBHOOK_SECRET is unset' }, 500);
  }

  // Loop back into our own webhook so the verified path runs for real.
  const webhookUrl = new URL('/api/webhooks/razorpay', request.url);
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-razorpay-signature': signature,
    },
    body: rawBody,
  });
  const webhookResult = await res.json().catch(() => null);
  return json({ simulated: true, webhook_status: res.status, webhook: webhookResult }, res.ok ? 200 : 502);
};
