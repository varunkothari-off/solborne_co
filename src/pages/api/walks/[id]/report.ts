/**
 * POST /api/walks/:id/report — kick preliminary-report generation (202).
 * GET  /api/walks/:id/report — status + timing only (the report body itself
 * is members-only, via GET /api/me/walks).
 *
 * Generation runs as a fire-and-forget async job in this node process:
 * start_walk_report() flips submitted → report_generating atomically (so a
 * double-kick can't run two generations), the LLM produces the report (via
 * lib/llm.ts's REPORT stage, which runs its own RESEARCH stage first when
 * either key is real), finish_walk_report() stores it. On failure the walk
 * returns to 'submitted' for retry.
 *
 * Kick auth: the walk's owner (Bearer) — or the internal secret header.
 */
import type { APIRoute } from 'astro';
import {
  getUserFromRequest,
  userRpc,
  internalRpc,
  internalSecretOk,
  rpc,
  RpcError,
} from '../../../../lib/supabase';
import { json, errorResponse, isUuid } from '../../../../lib/api';
import { rateLimit, clientKey, tooManyRequests } from '../../../../lib/rateLimit';
import { generateWalkReport, isStageStub, type WalkAnswerInput } from '../../../../lib/llm';

export const prerender = false;

async function ownsWalk(token: string, walkId: string): Promise<boolean> {
  const mine = await userRpc<{ walk_id: string }[]>(token, 'my_walks');
  return (mine ?? []).some((w) => w.walk_id === walkId);
}

export const POST: APIRoute = async ({ request, params, clientAddress }) => {
  const rl = rateLimit(clientKey(clientAddress, request, 'walk-report'), 6, 60_000);
  if (!rl.ok) return tooManyRequests(rl);
  if (!isUuid(params.id)) return json({ error: 'invalid walk id' }, 400);
  const walkId = params.id;

  // Owner or internal.
  if (!(await internalSecretOk(request))) {
    const auth = await getUserFromRequest(request);
    if (!auth) return json({ error: 'authentication required' }, 401);
    if (!(await ownsWalk(auth.token, walkId))) {
      return json({ error: 'walk not found or not yours' }, 403);
    }
  }

  try {
    // Atomic single-shot claim of the generation slot.
    const payload = await internalRpc<{
      walk_id: string;
      contact: Record<string, unknown>;
      answers: WalkAnswerInput[];
    }>('start_walk_report', { p_walk_id: walkId });

    void (async () => {
      try {
        const report = await generateWalkReport({
          answers: payload.answers ?? [],
          contact: payload.contact ?? {},
        });
        await internalRpc('finish_walk_report', {
          p_walk_id: walkId,
          p_report: report,
        });
      } catch (err) {
        console.error('[report] generation failed for walk', walkId, err);
        await internalRpc('fail_walk_report', { p_walk_id: walkId }).catch(() => {});
      }
    })();

    return json({ ok: true, generating: true, stub: isStageStub('report') }, 202);
  } catch (err) {
    // "not awaiting a report" = already generating/ready — report as OK state.
    if (err instanceof RpcError && err.status === 400) {
      return json({ ok: true, generating: false, note: err.message }, 200);
    }
    return errorResponse(err);
  }
};

export const GET: APIRoute = async ({ params }) => {
  if (!isUuid(params.id)) return json({ error: 'invalid walk id' }, 400);
  try {
    const status = await rpc<Record<string, unknown> | null>('walk_report_status', {
      p_walk_id: params.id,
    });
    if (!status) return json({ error: 'walk not found' }, 404);
    return json(status);
  } catch (err) {
    return errorResponse(err);
  }
};
