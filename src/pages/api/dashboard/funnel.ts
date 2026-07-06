/**
 * GET /api/dashboard/funnel — live funnel/conversion view (spec: founder).
 * Founder auth = the X-Internal-Secret header (the founder holds the
 * INTERNAL_API_SECRET). Counts only; no lead PII in the response.
 */
import type { APIRoute } from 'astro';
import { internalSecretOk, internalRpc } from '../../../lib/supabase';
import { json, errorResponse } from '../../../lib/api';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  if (!(await internalSecretOk(request))) {
    return json({ error: 'forbidden' }, 403);
  }
  try {
    const snapshot = await internalRpc<Record<string, unknown>>('funnel_snapshot');
    return json(snapshot);
  } catch (err) {
    return errorResponse(err);
  }
};
