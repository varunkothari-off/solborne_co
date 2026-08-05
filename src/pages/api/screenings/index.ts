/**
 * POST /api/screenings — start the live AI screening session (members-only).
 * Body: { walk_id? }
 *
 * The screening call is an in-browser WebRTC conversation with the
 * ElevenLabs agent — no phone number, no scheduled time. Ordering is the
 * reserve_call discipline: begin_screening_session runs the paid-package
 * gate + the per-package session cap atomically in the database (inserting a
 * fresh screenings row) BEFORE any token is minted, so an unpaid member can
 * never open a live session. The mint response's conversation_id is stored on
 * the row via mark_screening_triggered BEFORE the token is returned; that RPC
 * now reports whether the write landed, so a token is never released with its
 * conversation_id unstored (the post-call webhook keys on conversation_id).
 *
 * Two throttles guard the real mint: a per-IP bucket and a per-user bucket —
 * the latter survives X-Forwarded-For spoofing (the IP bucket does not; see
 * rateLimit.ts). And a real token is refused entirely while the payment rail
 * is a stub (realVoiceBlockedByStubPayments) so a fabricated 'paid' can't
 * spend real credits.
 *
 * While the ElevenLabs keys are placeholders the stub mints a fake token
 * (stub: true) and the dashboard shows a simulated session instead of
 * connecting. GET /api/me/screenings lives in ../me/screenings.ts.
 */
import type { APIRoute } from 'astro';
import { getUserFromRequest, userRpc, internalRpc } from '../../../lib/supabase';
import { json, errorResponse, readJson, isUuid } from '../../../lib/api';
import { rateLimit, clientKey, tooManyRequests } from '../../../lib/rateLimit';
import { voiceProvider } from '../../../lib/voice';
import { realVoiceBlockedByStubPayments, screeningSessionsPerPackage } from '../../../lib/env';

export const prerender = false;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const rl = rateLimit(clientKey(clientAddress, request, 'screenings'), 6, 60_000);
  if (!rl.ok) return tooManyRequests(rl);

  const auth = await getUserFromRequest(request);
  if (!auth) return json({ error: 'authentication required' }, 401);

  // Second bucket keyed on the authenticated user — the real mint is
  // expensive, and the IP bucket alone is bypassable via X-Forwarded-For.
  const userRl = rateLimit(`screenings-user:${auth.user.id}`, 6, 60_000);
  if (!userRl.ok) return tooManyRequests(userRl);

  // Refuse a real, billable session while payments are still stubbed.
  if (realVoiceBlockedByStubPayments()) {
    return json({ error: 'screening calls are not available yet' }, 503);
  }

  const body = (await readJson(request)) as { walk_id?: string } | null;
  const walkId = body && isUuid(body.walk_id) ? body.walk_id : null;

  try {
    // 1. DB gate FIRST (atomic): active paid package + per-package session
    //    cap required; a fresh screenings row (its own conversation) exists
    //    before anything is minted.
    const begun = await userRpc<{ screening_id: string; lead_name: string | null }>(
      auth.token,
      'begin_screening_session',
      { p_walk_id: walkId, p_max_sessions: screeningSessionsPerPackage() }
    );

    // 2. Mint the WebRTC session token — the package is confirmed paid.
    const provider = voiceProvider();
    let session;
    try {
      session = await provider.createWebRtcSession({
        bookingId: begun.screening_id,
        leadName: begun.lead_name ?? undefined,
      });
    } catch (mintErr) {
      await internalRpc('mark_screening_session_failed', {
        p_screening_id: begun.screening_id,
      }).catch(() => {});
      console.error('[screening] session mint failed:', mintErr);
      return json({ error: 'the call could not be prepared — please try again' }, 502);
    }

    // 3. Store the conversation_id on the row BEFORE the token leaves the
    //    server. If the write did NOT land (row not 'scheduled'), fail closed
    //    — a live conversation whose id is stored nowhere can never be matched
    //    to a webhook, so we withhold the token and cancel the row instead.
    const attached = await internalRpc<boolean>('mark_screening_triggered', {
      p_screening_id: begun.screening_id,
      p_provider_call_id: session.conversationId,
    });
    if (!attached && !session.stub) {
      await internalRpc('mark_screening_session_failed', {
        p_screening_id: begun.screening_id,
      }).catch(() => {});
      return json({ error: 'the call could not be prepared — please try again' }, 502);
    }

    return json(
      {
        ok: true,
        screening_id: begun.screening_id,
        conversation_id: session.conversationId,
        token: session.token,
        lead_name: begun.lead_name,
        stub: session.stub,
      },
      201
    );
  } catch (err) {
    return errorResponse(err);
  }
};
