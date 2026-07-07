/**
 * GET /api/me/screenings — the member's screening calls.
 */
import type { APIRoute } from 'astro';
import { getUserFromRequest, userRpc } from '../../../lib/supabase';
import { json, errorResponse } from '../../../lib/api';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const auth = await getUserFromRequest(request);
  if (!auth) return json({ error: 'authentication required' }, 401);
  try {
    const screenings = await userRpc<unknown[]>(auth.token, 'my_screenings');
    return json({ screenings });
  } catch (err) {
    return errorResponse(err);
  }
};
