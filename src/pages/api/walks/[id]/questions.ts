/**
 * POST /api/walks/:id/questions — generate Part 2's "right questions" from
 * the Part-1 transcripts. Idempotent: once generated for a walk, the same
 * set is returned forever (set_walk_questions refuses regeneration).
 */
import type { APIRoute } from 'astro';
import { rpc, internalRpc } from '../../../../lib/supabase';
import { json, errorResponse, isUuid } from '../../../../lib/api';
import { rateLimit, clientKey, tooManyRequests } from '../../../../lib/rateLimit';
import { generateWalkQuestions, type WalkAnswerInput } from '../../../../lib/llm';

export const prerender = false;

export const POST: APIRoute = async ({ request, params, clientAddress }) => {
  const rl = rateLimit(clientKey(clientAddress, request, 'walk-questions'), 6, 60_000);
  if (!rl.ok) return tooManyRequests(rl);
  if (!isUuid(params.id)) return json({ error: 'invalid walk id' }, 400);

  try {
    const walkState = await rpc<{
      status: string;
      questions_generated: boolean;
      questions: string[];
      answers: WalkAnswerInput[];
    } | null>('get_walk', { p_walk_id: params.id });
    if (!walkState) return json({ error: 'walk not found' }, 404);

    if (walkState.questions_generated) {
      return json({ questions: walkState.questions, stub: false, cached: true });
    }

    const partOne = (walkState.answers ?? []).filter((a) => a.section === 'one');
    if (partOne.length < 1) {
      return json({ error: 'answer the first questions before this step' }, 400);
    }

    const generated = await generateWalkQuestions(partOne);
    const stored = await internalRpc<{ questions: string[] }>('set_walk_questions', {
      p_walk_id: params.id,
      p_questions: generated.questions,
    });
    return json({ questions: stored.questions, stub: generated.stub, cached: false });
  } catch (err) {
    return errorResponse(err);
  }
};
