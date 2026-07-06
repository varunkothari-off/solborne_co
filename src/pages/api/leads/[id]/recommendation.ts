/**
 * GET /api/leads/:id/recommendation — module-mapped recommendation (spec:
 * no auth; the unguessable lead uuid is the capability token). Reflects the
 * visitor's own answers back alongside the matched workflows. Never returns
 * the lead's email.
 */
import type { APIRoute } from 'astro';
import { rpc } from '../../../../lib/supabase';
import { json, errorResponse, isUuid } from '../../../../lib/api';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  if (!isUuid(params.id)) return json({ error: 'invalid lead id' }, 400);
  try {
    const rec = await rpc<Record<string, unknown> | null>('get_recommendation', {
      p_lead_id: params.id,
    });
    if (!rec) return json({ error: 'lead not found' }, 404);
    return json(rec);
  } catch (err) {
    return errorResponse(err);
  }
};
