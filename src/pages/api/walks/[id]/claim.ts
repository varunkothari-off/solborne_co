/**
 * POST /api/walks/:id/claim — bind an anonymous walk to the member who just
 * signed up. Refuses walks already owned by another member.
 */
import type { APIRoute } from 'astro';
import { getUserFromRequest, userRpc } from '../../../../lib/supabase';
import { json, errorResponse, isUuid } from '../../../../lib/api';

export const prerender = false;

export const POST: APIRoute = async ({ request, params }) => {
  const auth = await getUserFromRequest(request);
  if (!auth) return json({ error: 'authentication required' }, 401);
  if (!isUuid(params.id)) return json({ error: 'invalid walk id' }, 400);
  try {
    const result = await userRpc<Record<string, unknown>>(auth.token, 'claim_walk', {
      p_walk_id: params.id,
    });
    return json(result);
  } catch (err) {
    return errorResponse(err);
  }
};
