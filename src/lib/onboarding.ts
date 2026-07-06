/**
 * Shared onboarding orchestration used by both the Razorpay webhook route
 * (auto-trigger after verified payment) and the internal
 * POST /api/calls/trigger endpoint.
 *
 * The payment-before-call rule is enforced TWICE: here by call order, and in
 * the database — public.create_call() refuses any booking not in 'paid'
 * status.
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
  const provider = voiceProvider();
  const call = await provider.triggerOutboundCall({ bookingId });
  // create_call() raises unless the booking status is 'paid'.
  const callId = await internalRpc<string>('create_call', {
    p_booking_id: bookingId,
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
