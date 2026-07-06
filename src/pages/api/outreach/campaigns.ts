/**
 * POST /api/outreach/campaigns — internal (spec): marketing-automation
 * trigger for the Phase 4 growth layer. Records the campaign request;
 * execution belongs to Phase 4 and is deliberately not built here.
 */
import type { APIRoute } from 'astro';
import { internalSecretOk, internalRpc } from '../../../lib/supabase';
import { json, errorResponse, readJson } from '../../../lib/api';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!(await internalSecretOk(request))) {
    return json({ error: 'forbidden' }, 403);
  }
  const body = await readJson(request, 20_000);
  if (!body || typeof body !== 'object') {
    return json({ error: 'invalid JSON body' }, 400);
  }
  try {
    const id = await internalRpc<string>('create_outreach_campaign', { p: body });
    return json({ ok: true, campaign_id: id }, 201);
  } catch (err) {
    return errorResponse(err);
  }
};
