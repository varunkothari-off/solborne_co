/**
 * GET /api/me/walks — the member's walks: answers (editable), status,
 * durations, and the report body once ready. Members-only.
 */
import type { APIRoute } from 'astro';
import { getUserFromRequest, userRpc } from '../../../lib/supabase';
import { json, errorResponse } from '../../../lib/api';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const auth = await getUserFromRequest(request);
  if (!auth) return json({ error: 'authentication required' }, 401);
  try {
    const walks = await userRpc<unknown[]>(auth.token, 'my_walks');
    return json({ walks });
  } catch (err) {
    return errorResponse(err);
  }
};
