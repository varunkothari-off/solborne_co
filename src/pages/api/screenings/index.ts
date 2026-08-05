/**
 * POST /api/screenings — start the live AI screening session (members-only).
 * Body: { walk_id? }
 *
 * The screening call is an in-browser WebRTC conversation with the
 * ElevenLabs agent — no phone number, no scheduled time. Ordering is the
 * reserve_call discipline: begin_screening_session runs the paid-package
 * gate atomically in the database (inserting the screenings row) BEFORE any
 * token is minted, so an unpaid member can never open a live session. The
 * mint response's conversation_id is stored on the row via
 * mark_screening_triggered BEFORE the token is returned, so the post-call
 * webhook (keyed on conversation_id) always resolves to this screening.
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

export const prerender = false;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const rl = rateLimit(clientKey(clientAddress, request, 'screenings'), 6, 60_000);
  if (!rl.ok) return tooManyRequests(rl);

  const auth = await getUserFromRequest(request);
  if (!auth) return json({ error: 'authentication required' }, 401);

  const body = (await readJson(request)) as { walk_id?: string } | null;
  const walkId = body && isUuid(body.walk_id) ? body.walk_id : null;

  try {
    // 1. DB gate FIRST (atomic, reserve_call-style): active paid package
    //    required; the screenings row exists before anything is minted.
    const begun = await userRpc<{ screening_id: string; lead_name: string | null }>(
      auth.token,
      'begin_screening_session',
      { p_walk_id: walkId }
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
    //    server — the webhook correlation depends on this write.
    await internalRpc('mark_screening_triggered', {
      p_screening_id: begun.screening_id,
      p_provider_call_id: session.conversationId,
    });

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
