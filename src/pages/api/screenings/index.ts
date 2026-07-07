/**
 * POST /api/screenings — schedule the AI screening call (members-only).
 * Body: { walk_id?, phone, when: 'now' | ISO-8601 }
 *
 * "now" triggers the voice provider immediately (the ElevenLabs stub until
 * the real keys + the release-gate test call exist). Future-dated screenings
 * are stored; actually firing them needs the scheduler from the go-live
 * checklist (flagged — no cron exists yet).
 *
 * GET /api/me/screenings lives in ../me/screenings.ts.
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

  const body = (await readJson(request)) as {
    walk_id?: string;
    phone?: unknown;
    when?: unknown;
  } | null;
  if (!body || typeof body.phone !== 'string') {
    return json({ error: 'phone required' }, 400);
  }
  const walkId = isUuid(body.walk_id) ? body.walk_id : null;

  const isNow = body.when === 'now' || typeof body.when === 'undefined';
  let scheduledAt: string | null = null;
  if (!isNow) {
    const parsed = new Date(String(body.when));
    if (Number.isNaN(parsed.getTime()) || parsed.getTime() < Date.now() - 60_000) {
      return json({ error: 'pick a valid future time, or "now"' }, 400);
    }
    scheduledAt = parsed.toISOString();
  }

  try {
    const scheduled = await userRpc<{ screening_id: string }>(
      auth.token,
      'schedule_screening',
      { p_walk_id: walkId, p_phone: body.phone, p_scheduled_at: scheduledAt }
    );

    let call: { providerCallId: string; stub: boolean } | null = null;
    if (isNow) {
      try {
        const provider = voiceProvider();
        call = await provider.triggerOutboundCall({
          bookingId: scheduled.screening_id,
          toNumber: body.phone.trim(),
        });
        await internalRpc('mark_screening_triggered', {
          p_screening_id: scheduled.screening_id,
          p_provider_call_id: call.providerCallId,
        });
      } catch (callErr) {
        // The screening stays 'scheduled' and can be re-triggered.
        console.error('[screening] immediate trigger failed:', callErr);
      }
    }

    return json({ ok: true, ...scheduled, immediate: isNow, call }, 201);
  } catch (err) {
    return errorResponse(err);
  }
};
