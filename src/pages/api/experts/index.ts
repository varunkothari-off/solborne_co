/**
 * GET /api/experts — public expert cards for the reveal screen (spec: no
 * auth). Returns an empty list until real experts exist — the UI renders
 * the spec's "waiting on expert assignment" state; no invented people.
 */
import type { APIRoute } from 'astro';
import { rpc } from '../../../lib/supabase';
import { json, errorResponse } from '../../../lib/api';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const experts = await rpc<unknown[]>('list_experts');
    return json({ experts });
  } catch (err) {
    return errorResponse(err);
  }
};
