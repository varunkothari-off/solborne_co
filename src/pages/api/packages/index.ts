/**
 * The screening package — THE PAYWALL (founder decision 2026-07-08).
 * Free: the walk + preliminary read. Paid: everything from "schedule the
 * first call" onward — one payment covers the AI screening calls, expert
 * screening calls, and the final audit report.
 *
 * GET  /api/packages — the member's package state + the price (Phase-0
 *      fair-pricing research: $1,497 flat, USD-first).
 * POST /api/packages — start/resume the purchase: creates the package
 *      booking + a payment order through the provider seam (Razorpay stub
 *      until real keys; the signed-webhook capture path is identical).
 */
import type { APIRoute } from 'astro';
import { getUserFromRequest, userRpc, internalRpc } from '../../../lib/supabase';
import { json, errorResponse } from '../../../lib/api';
import { rateLimit, clientKey, tooManyRequests } from '../../../lib/rateLimit';
import { paymentProvider } from '../../../lib/payments';
import { screeningPackagePrice } from '../../../lib/env';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const auth = await getUserFromRequest(request);
  if (!auth) return json({ error: 'authentication required' }, 401);
  try {
    const pkg = await userRpc<Record<string, unknown>>(auth.token, 'my_package');
    return json({ ...pkg, price: screeningPackagePrice() });
  } catch (err) {
    return errorResponse(err);
  }
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const rl = rateLimit(clientKey(clientAddress, request, 'packages'), 6, 60_000);
  if (!rl.ok) return tooManyRequests(rl);

  const auth = await getUserFromRequest(request);
  if (!auth) return json({ error: 'authentication required' }, 401);

  try {
    const purchase = await userRpc<{
      booking_id: string;
      already_active: boolean;
    }>(auth.token, 'purchase_screening_package');

    if (purchase.already_active) {
      return json({ active: true, booking_id: purchase.booking_id });
    }

    const price = screeningPackagePrice();
    const provider = paymentProvider();
    const order = await provider.createOrder({
      bookingId: purchase.booking_id,
      amountPaise: price.amountMinor, // minor units; currency per config
      currency: price.currency,
    });
    await internalRpc('record_payment_order', {
      p_booking_id: purchase.booking_id,
      p_order_id: order.orderId,
      p_amount: order.amountPaise,
      p_currency: order.currency,
    });

    return json(
      {
        active: false,
        booking_id: purchase.booking_id,
        order: {
          order_id: order.orderId,
          amount_minor: order.amountPaise,
          currency: order.currency,
          display: price.display,
          stub: order.stub,
        },
      },
      201
    );
  } catch (err) {
    return errorResponse(err);
  }
};
