/**
 * POST /api/calls/trigger — internal (spec). Prepares the live WebRTC
 * screening session for a legacy booking and returns the session token.
 * Gated on the X-Internal-Secret header; the database additionally refuses
 * any booking that is not in 'paid' status, so this can never open a live
 * session ahead of a verified payment.
 */
import type { APIRoute } from 'astro';
import { internalSecretOk } from '../../../lib/supabase';
import { createSessionForBooking } from '../../../lib/onboarding';
import { json, errorResponse, readJson, isUuid } from '../../../lib/api';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!(await internalSecretOk(request))) {
    return json({ error: 'forbidden' }, 403);
  }
  const body = (await readJson(request)) as { booking_id?: string } | null;
  if (!body || !isUuid(body.booking_id)) {
    return json({ error: 'booking_id (uuid) required' }, 400);
  }
  try {
    const result = await createSessionForBooking(body.booking_id);
    return json({ ok: true, ...result });
  } catch (err) {
    return errorResponse(err);
  }
};
