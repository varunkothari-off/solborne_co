/**
 * Shared onboarding orchestration used by both the Razorpay webhook route
 * (auto-trigger after verified payment) and the internal
 * POST /api/calls/trigger endpoint.
 *
 * The payment-before-call rule is enforced by ordering: reserve_call runs the
 * atomic paid-gate (and booking transition) in the database BEFORE the
 * outbound provider call is placed, so a call can never precede a payment.
 */
import { internalRpc } from './supabase';
import { voiceProvider } from './voice';
import { roadmap } from '../data/roadmap';

export interface TriggeredCallResult {
  callId: string;
  providerCallId: string;
  stub: boolean;
}

export async function triggerCallForBooking(
  bookingId: string
): Promise<TriggeredCallResult> {
  // 1. DB gate FIRST: reserve_call atomically requires status='paid' and
  //    transitions the booking to 'call_scheduled', inserting the calls row.
  //    Nothing is dialled until this passes, so an unpaid booking can never
  //    place an outbound call — the ordering the spec requires.
  const callId = await internalRpc<string>('reserve_call', {
    p_booking_id: bookingId,
  });

  // The destination number lives server-side on the booking (never trusted
  // from the caller here). The stub ignores it; the real provider dials it.
  const toNumber = await internalRpc<string | null>('get_booking_phone', {
    p_booking_id: bookingId,
  });

  // 2. Now place the outbound call — the booking is confirmed paid.
  const provider = voiceProvider();
  let call;
  try {
    call = await provider.triggerOutboundCall({ bookingId, toNumber: toNumber ?? undefined });
  } catch (err) {
    // Dial failed: mark the call failed and hand the booking back to 'paid'
    // so it can be retried via POST /api/calls/trigger.
    await internalRpc('mark_call_failed', { p_call_id: callId }).catch(() => {});
    throw err;
  }

  // 3. Record the provider's call id against the reserved row.
  await internalRpc('attach_provider_call_id', {
    p_call_id: callId,
    p_provider_call_id: call.providerCallId,
  });
  return { callId, providerCallId: call.providerCallId, stub: call.stub };
}

/** slug -> category name, from the single catalog source of truth. */
const slugCategory = new Map<string, string>();
for (const category of roadmap) {
  for (const item of category.items) {
    if (item.slug) slugCategory.set(item.slug, category.name);
  }
}

/**
 * Related-vs-separate-call logic (spec: POST /api/bookings "handles
 * related-vs-separate-call logic from multi-select"): selections within one
 * catalog category are related — one call covers them. Selections spanning
 * categories get a split plan (separate call segments).
 */
export function computeCallPlan(selections: string[]): {
  callPlan: 'single' | 'split';
  categories: string[];
  unknown: string[];
} {
  const categories = new Set<string>();
  const unknown: string[] = [];
  for (const slug of selections) {
    const cat = slugCategory.get(slug);
    if (cat) categories.add(cat);
    else unknown.push(slug);
  }
  return {
    callPlan: categories.size > 1 ? 'split' : 'single',
    categories: [...categories],
    unknown,
  };
}
