/**
 * POST /api/leads — free diagnostic submission (spec: no auth).
 * Body: the payload assembled by the diagnostic page (lead + answers).
 * Returns the lead id, which doubles as the capability token for
 * GET /api/leads/:id/recommendation and the /book/ flow.
 */
import type { APIRoute } from 'astro';
import { rpc } from '../../../lib/supabase';
import { json, errorResponse, readJson } from '../../../lib/api';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const body = await readJson(request, 24_000);
  if (!body || typeof body !== 'object') {
    return json({ error: 'invalid JSON body' }, 400);
  }
  try {
    const leadId = await rpc<string>('submit_lead', { p: body });
    return json(
      {
        lead_id: leadId,
        recommendation_url: `/api/leads/${leadId}/recommendation`,
        book_url: `/book/?lead=${leadId}`,
      },
      201
    );
  } catch (err) {
    return errorResponse(err);
  }
};
