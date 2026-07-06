/**
 * POST /api/experts/:id/availability — the sick-toggle (spec: auth, expert).
 * The database updates the expert row bound to the signed-in user
 * (auth.uid()), so an expert can only ever flip their own availability; the
 * URL id is cross-checked against the updated row.
 *
 * Body: { available: boolean }
 */
import type { APIRoute } from 'astro';
import { getUserFromRequest, userRpc } from '../../../../lib/supabase';
import { json, errorResponse, readJson, isUuid } from '../../../../lib/api';

export const prerender = false;

export const POST: APIRoute = async ({ request, params }) => {
  const auth = await getUserFromRequest(request);
  if (!auth) return json({ error: 'authentication required' }, 401);
  if (!isUuid(params.id)) return json({ error: 'invalid expert id' }, 400);

  const body = (await readJson(request)) as { available?: unknown } | null;
  if (!body || typeof body.available !== 'boolean') {
    return json({ error: 'available (boolean) required' }, 400);
  }

  try {
    // Ownership is verified inside the same UPDATE (user_id = auth.uid() AND
    // id = p_expert_id), so a mismatched URL id updates zero rows and raises
    // rather than mutating the caller's own availability first.
    const result = await userRpc<{ expert_id: string; available: boolean }>(
      auth.token,
      'set_expert_availability',
      { p_expert_id: params.id, p_available: body.available }
    );
    return json({ ok: true, ...result });
  } catch (err) {
    return errorResponse(err);
  }
};
