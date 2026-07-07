/**
 * POST /api/leads — LEGACY (the old rule-based diagnostic; superseded by /api/walks).
 * Body: the payload assembled by the diagnostic page (lead + answers).
 * Returns the lead id, which doubles as the capability token for
 * GET /api/leads/:id/recommendation and the /book/ flow.
 */
import type { APIRoute } from 'astro';
import { rpc } from '../../../lib/supabase';
import { json, errorResponse, readJson } from '../../../lib/api';
import { rateLimit, clientKey, tooManyRequests } from '../../../lib/rateLimit';

export const prerender = false;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  // Cap fake-lead spam: 10 submissions per IP per minute.
  const rl = rateLimit(clientKey(clientAddress, request, 'leads'), 10, 60_000);
  if (!rl.ok) return tooManyRequests(rl);

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
