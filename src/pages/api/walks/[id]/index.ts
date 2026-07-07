/**
 * GET /api/walks/:id — resume/progress state (answers so far, generated
 * questions, status). Capability by walk uuid; never includes the report.
 */
import type { APIRoute } from 'astro';
import { rpc } from '../../../../lib/supabase';
import { json, errorResponse, isUuid } from '../../../../lib/api';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  if (!isUuid(params.id)) return json({ error: 'invalid walk id' }, 400);
  try {
    const walkState = await rpc<Record<string, unknown> | null>('get_walk', {
      p_walk_id: params.id,
    });
    if (!walkState) return json({ error: 'walk not found' }, 404);
    return json(walkState);
  } catch (err) {
    return errorResponse(err);
  }
};
