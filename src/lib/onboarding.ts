/**
 * Shared onboarding orchestration. Since the WebRTC rewrite (2026-08-06) the
 * screening call is an in-browser live session, not an outbound dial — this
 * is invoked by the internal POST /api/calls/trigger (ops) to prepare a
 * session for a legacy booking.
 *
 * The payment-before-call rule is enforced by ordering: reserve_call runs the
 * atomic paid-gate (and booking transition) in the database BEFORE any
 * ElevenLabs session token is minted, so a live session can never precede a
 * payment.
 */
import { internalRpc } from './supabase';
import { voiceProvider } from './voice';
import { roadmap } from '../data/roadmap';

export interface BookingSessionResult {
  callId: string;
  /** The ElevenLabs conversation id — stored as calls.provider_call_id, the
      correlation key post-call webhooks are matched on. */
  conversationId: string;
  /** Short-lived WebRTC token for @elevenlabs/client in the browser. */
  token: string;
  stub: boolean;
}

export async function createSessionForBooking(
  bookingId: string
): Promise<BookingSessionResult> {
  // 1. DB gate FIRST: reserve_call atomically requires status='paid' and
  //    transitions the booking to 'call_scheduled', inserting the calls row.
  //    No token is minted until this passes, so an unpaid booking can never
  //    open a live session — the ordering the spec requires.
  const callId = await internalRpc<string>('reserve_call', {
    p_booking_id: bookingId,
  });

  // 2. Now mint the WebRTC session — the booking is confirmed paid.
  const provider = voiceProvider();
  let session;
  try {
    session = await provider.createWebRtcSession({ bookingId });
  } catch (err) {
    // Mint failed: mark the call failed and hand the booking back to 'paid'
    // so it can be retried via POST /api/calls/trigger.
    await internalRpc('mark_call_failed', { p_call_id: callId }).catch(() => {});
    throw err;
  }

  // 3. Record the conversation id against the reserved row BEFORE the token
  //    goes anywhere — this is what lets the post-call webhook (keyed on
  //    conversation_id) find its way back to this call. If this write fails
  //    (transient DB/network), compensate: mark the call failed and hand the
  //    booking back to 'paid', so it isn't wedged in 'call_scheduled' with a
  //    call row that has no conversation_id and no way to complete. The token
  //    is withheld either way (we throw).
  try {
    await internalRpc('attach_provider_call_id', {
      p_call_id: callId,
      p_provider_call_id: session.conversationId,
    });
  } catch (err) {
    await internalRpc('mark_call_failed', { p_call_id: callId }).catch(() => {});
    throw err;
  }
  return {
    callId,
    conversationId: session.conversationId,
    token: session.token,
    stub: session.stub,
  };
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
