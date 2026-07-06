/**
 * POST /api/calls/:id/transcript — internal (spec). Receives the call
 * outcome and feeds the routing decision. Low-confidence routings are
 * flagged for human review before any reveal (enforced in-database:
 * confidence < 0.7 sets needs_human_review and skips expert assignment).
 *
 * Body: { transcript: object, routing: { category: string }, confidence: number }
 */
import type { APIRoute } from 'astro';
import { internalSecretOk, internalRpc } from '../../../../lib/supabase';
import { json, errorResponse, readJson, isUuid } from '../../../../lib/api';

export const prerender = false;

export const POST: APIRoute = async ({ request, params }) => {
  if (!(await internalSecretOk(request))) {
    return json({ error: 'forbidden' }, 403);
  }
  if (!isUuid(params.id)) return json({ error: 'invalid call id' }, 400);

  // A full discovery-call transcript can be large; cap generously and report
  // an oversize body as 413 rather than a misleading "transcript required".
  const MAX = 1_000_000;
  const raw = await request.text();
  if (raw.length > MAX) {
    return json({ error: 'transcript payload too large' }, 413);
  }
  let body: {
    transcript?: unknown;
    routing?: { category?: unknown };
    confidence?: unknown;
  } | null;
  try {
    body = JSON.parse(raw);
  } catch {
    body = null;
  }
  if (!body || typeof body.transcript === 'undefined') {
    return json({ error: 'transcript required' }, 400);
  }
  const confidence =
    typeof body.confidence === 'number' &&
    body.confidence >= 0 &&
    body.confidence <= 1
      ? body.confidence
      : 0; // Missing/invalid confidence is treated as zero => human review.

  try {
    const result = await internalRpc<Record<string, unknown>>('ingest_transcript', {
      p_call_id: params.id,
      p_transcript: body.transcript,
      p_routing: body.routing ?? {},
      p_confidence: confidence,
    });
    return json({ ok: true, ...result });
  } catch (err) {
    return errorResponse(err);
  }
};
