/**
 * Speech-to-text seam for the walk's voice answers.
 *
 * Real provider: ElevenLabs Scribe (same API key as the voice agent — one
 * human step unblocks both directions). Stub while the key is absent or a
 * placeholder: returns a labelled preview transcript so the flow stays
 * testable end-to-end without a key and without any network call.
 *
 * Swapping vendors later (Wispr / Sarvam) = implement TranscriptionProvider
 * in one new file and change the selection below.
 */
import { realEnv, stubMode } from './env';

export interface TranscriptionProvider {
  readonly name: string;
  readonly isStub: boolean;
  transcribe(audio: Buffer, mime: string): Promise<string>;
}

const elevenLabsStt: TranscriptionProvider = {
  name: 'elevenlabs-scribe',
  isStub: false,

  async transcribe(audio: Buffer, mime: string): Promise<string> {
    const apiKey = realEnv('ELEVENLABS_API_KEY');
    if (!apiKey) throw new Error('ELEVENLABS_API_KEY missing');
    const form = new FormData();
    form.append('model_id', 'scribe_v1');
    form.append(
      'file',
      new Blob([new Uint8Array(audio)], { type: mime || 'audio/webm' }),
      'answer.webm'
    );
    const res = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: { 'xi-api-key': apiKey },
      body: form,
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`transcription failed (${res.status}): ${detail.slice(0, 300)}`);
    }
    const data = (await res.json()) as { text?: string };
    const text = (data.text ?? '').trim();
    if (!text) throw new Error('transcription returned empty text');
    return text;
  },
};

// STUB: replaced by the real ElevenLabs Scribe call once ELEVENLABS_API_KEY
// is set — see docs/human-steps-checklist.md step 2. Zero network calls.
const sttStub: TranscriptionProvider = {
  name: 'stt-stub',
  isStub: true,

  async transcribe(audio: Buffer, _mime: string): Promise<string> {
    const seconds = Math.max(1, Math.round(audio.length / 12_000));
    return (
      `[Preview transcript — real voice transcription switches on when the ` +
      `ElevenLabs key is added. We received about ${seconds}s of audio.]`
    );
  },
};

export function sttProvider(): TranscriptionProvider {
  // The walk's transcription needs only the API key (not agent/phone ids).
  return realEnv('ELEVENLABS_API_KEY') ? elevenLabsStt : sttStub;
}

/** Surface stub-ness of the whole voice pipeline for the UI banners. */
export function voicePreviewMode(): boolean {
  return sttProvider().isStub || stubMode.elevenlabs;
}
