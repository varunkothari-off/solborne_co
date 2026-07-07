/**
 * POST /api/answers/:id/edit — a member corrects a transcript of their own
 * spoken answer (ownership enforced in-database via the walk's user_id).
 * Body: { text }
 */
import type { APIRoute } from 'astro';
import { getUserFromRequest, userRpc } from '../../../../lib/supabase';
import { json, errorResponse, isUuid, readJson } from '../../../../lib/api';

export const prerender = false;

export const POST: APIRoute = async ({ request, params }) => {
  const auth = await getUserFromRequest(request);
  if (!auth) return json({ error: 'authentication required' }, 401);
  if (!isUuid(params.id)) return json({ error: 'invalid answer id' }, 400);

  const body = (await readJson(request, 24_000)) as { text?: unknown } | null;
  if (!body || typeof body.text !== 'string' || body.text.trim() === '') {
    return json({ error: 'text required' }, 400);
  }
  try {
    const result = await userRpc<Record<string, unknown>>(auth.token, 'edit_walk_answer', {
      p_answer_id: params.id,
      p_text: body.text.trim().slice(0, 20000),
    });
    return json(result);
  } catch (err) {
    return errorResponse(err);
  }
};
