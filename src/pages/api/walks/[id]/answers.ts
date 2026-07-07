/**
 * POST /api/walks/:id/answers — one spoken answer: audio in, transcript out.
 * Body: { section: 'one'|'two', index, question, audio_base64, mime }
 *
 * Pipeline: decode → transcribe (ElevenLabs Scribe, or the labelled stub
 * while the key is absent) → archive raw audio (only when the service-role
 * key exists) → store transcript via save_walk_answer. Re-recording the same
 * question overwrites (upsert in the RPC).
 */
import type { APIRoute } from 'astro';
import { rpc, storeWalkAudio } from '../../../../lib/supabase';
import { json, errorResponse, isUuid } from '../../../../lib/api';
import { rateLimit, clientKey, tooManyRequests } from '../../../../lib/rateLimit';
import { sttProvider } from '../../../../lib/stt';

export const prerender = false;

// ~9 MB of audio after base64 inflation — several minutes of opus speech.
const MAX_BODY = 12_500_000;

export const POST: APIRoute = async ({ request, params, clientAddress }) => {
  const rl = rateLimit(clientKey(clientAddress, request, 'walk-answers'), 30, 60_000);
  if (!rl.ok) return tooManyRequests(rl);
  if (!isUuid(params.id)) return json({ error: 'invalid walk id' }, 400);

  const raw = await request.text();
  if (raw.length > MAX_BODY) return json({ error: 'recording too large' }, 413);
  let body: {
    section?: unknown;
    index?: unknown;
    question?: unknown;
    audio_base64?: unknown;
    mime?: unknown;
  } | null;
  try {
    body = JSON.parse(raw);
  } catch {
    body = null;
  }
  if (
    !body ||
    (body.section !== 'one' && body.section !== 'two') ||
    typeof body.index !== 'number' ||
    body.index < 0 ||
    body.index > 19 ||
    typeof body.question !== 'string' ||
    typeof body.audio_base64 !== 'string' ||
    body.audio_base64.length < 100
  ) {
    return json({ error: 'section, index, question and audio are required' }, 400);
  }

  let audio: Buffer;
  try {
    audio = Buffer.from(body.audio_base64, 'base64');
  } catch {
    return json({ error: 'audio is not valid base64' }, 400);
  }
  const mime = typeof body.mime === 'string' ? body.mime.slice(0, 100) : 'audio/webm';

  try {
    const stt = sttProvider();
    const transcript = await stt.transcribe(audio, mime);

    // Raw-audio archive is best-effort: never blocks the walk.
    const audioPath = await storeWalkAudio(
      params.id,
      body.section,
      body.index,
      audio,
      mime
    ).catch(() => null);

    await rpc('save_walk_answer', {
      p_walk_id: params.id,
      p_section: body.section,
      p_index: body.index,
      p_question: body.question.slice(0, 1000),
      p_transcript: transcript.slice(0, 20000),
      p_audio_path: audioPath,
    });

    return json({ transcript, stub: stt.isStub }, 201);
  } catch (err) {
    return errorResponse(err);
  }
};
