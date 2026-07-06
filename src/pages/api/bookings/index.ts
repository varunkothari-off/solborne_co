/**
 * POST /api/bookings — schedule-a-call (spec: auth required; handles
 * related-vs-separate-call logic from the multi-select).
 *
 * Body: { lead_id?, selections: string[], consent: boolean }
 * The call plan is computed SERVER-SIDE from the catalog's category map —
 * selections within one category share a single call; spanning categories
 * yields a split plan. Requires the explicit automated-call consent
 * (spec constraint) — refused in-database as well.
 *
 * On success, creates the payment order via the payment provider seam
 * (Razorpay stub until real keys exist) and records it.
 */
import type { APIRoute } from 'astro';
import { getUserFromRequest, userRpc, internalRpc } from '../../../lib/supabase';
import { json, errorResponse, readJson, isUuid } from '../../../lib/api';
import { paymentProvider } from '../../../lib/payments';
import { computeCallPlan } from '../../../lib/onboarding';
import { discoveryCallAmountPaise } from '../../../lib/env';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const auth = await getUserFromRequest(request);
  if (!auth) return json({ error: 'authentication required' }, 401);

  const body = (await readJson(request, 8_000)) as {
    lead_id?: string;
    selections?: unknown;
    consent?: unknown;
  } | null;
  if (!body) return json({ error: 'invalid JSON body' }, 400);

  const selections = Array.isArray(body.selections)
    ? body.selections.filter((s): s is string => typeof s === 'string').slice(0, 10)
    : [];
  if (selections.length === 0) {
    return json({ error: 'select at least one workflow' }, 400);
  }
  if (body.consent !== true) {
    return json(
      { error: 'explicit consent to the automated discovery call is required' },
      400
    );
  }
  const leadId = isUuid(body.lead_id) ? body.lead_id : null;
  const plan = computeCallPlan(selections);
  if (plan.unknown.length > 0) {
    return json({ error: `unknown workflows: ${plan.unknown.join(', ')}` }, 400);
  }

  try {
    const { booking_id } = await userRpc<{ booking_id: string }>(
      auth.token,
      'create_booking',
      {
        p_lead_id: leadId,
        p_selections: selections,
        p_call_plan: plan.callPlan,
        p_consent: true,
      }
    );

    const provider = paymentProvider();
    const order = await provider.createOrder({
      bookingId: booking_id,
      amountPaise: discoveryCallAmountPaise(),
      currency: 'INR',
    });
    await internalRpc('record_payment_order', {
      p_booking_id: booking_id,
      p_order_id: order.orderId,
      p_amount: order.amountPaise,
      p_currency: order.currency,
    });

    return json(
      {
        booking_id,
        call_plan: plan.callPlan,
        categories: plan.categories,
        order: {
          order_id: order.orderId,
          amount: order.amountPaise,
          currency: order.currency,
          stub: order.stub,
        },
      },
      201
    );
  } catch (err) {
    return errorResponse(err);
  }
};
