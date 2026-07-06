/**
 * GET /api/bookings/:id — booking status for the confirmation/reveal screen.
 * The unguessable booking uuid is the capability token; the response carries
 * no PII beyond the assigned expert's public card (or null while the spec's
 * "waiting on expert assignment" state applies).
 */
import type { APIRoute } from 'astro';
import { rpc } from '../../../lib/supabase';
import { json, errorResponse, isUuid } from '../../../lib/api';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  if (!isUuid(params.id)) return json({ error: 'invalid booking id' }, 400);
  try {
    const status = await rpc<Record<string, unknown> | null>(
      'get_booking_status',
      { p_booking_id: params.id }
    );
    if (!status) return json({ error: 'booking not found' }, 404);
    return json(status);
  } catch (err) {
    return errorResponse(err);
  }
};
