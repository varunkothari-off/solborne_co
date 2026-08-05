/**
 * Voice provider seam (the paid screening call). Every caller goes through
 * voiceProvider() — the same interface a real ElevenLabs integration uses —
 * so going live is a key-paste plus src/lib/providers/elevenlabs.ts.
 *
 * ARCHITECTURE (2026-08-06): the screening call is an in-browser, real-time
 * WebRTC conversation with the ElevenLabs agent — no phone number, no Twilio,
 * no scheduled call time. The server mints a short-lived conversation token
 * (this seam); the browser connects with @elevenlabs/client. The token mint
 * response includes the conversation_id, which is stored on the screening/
 * call row BEFORE the browser ever connects — that server-known id is the
 * one trusted correlation key for post-call webhooks.
 *
 * HARD RELEASE GATE: the system is NOT launch-ready until ElevenLabs is
 * verified with a real, supervised, talked-through browser session. Stub
 * completeness is not the same as done.
 */
import { stubMode } from './env';
import { elevenLabsStub } from './stubs/elevenlabs';
import { elevenLabsReal } from './providers/elevenlabs';

export interface CreateSessionInput {
  /** The screening/booking uuid this session belongs to. Passed to the agent
      as the booking_id dynamic variable (client-side; informational only —
      correlation never relies on it). */
  bookingId: string;
  /** Lead's first name for the agent's greeting; no other PII is passed. */
  leadName?: string;
}

export interface WebRtcSession {
  /** Short-lived token the browser hands to Conversation.startSession(). */
  token: string;
  /** Known at mint time — store it server-side before returning the token. */
  conversationId: string;
  /** true when produced by the stub — surfaced to the UI so it can say so. */
  stub: boolean;
}

export interface VoiceProvider {
  readonly name: string;
  readonly isStub: boolean;
  createWebRtcSession(input: CreateSessionInput): Promise<WebRtcSession>;
}

export function voiceProvider(): VoiceProvider {
  // STUB SELECTION: while ELEVENLABS_API_KEY_AGENT / ELEVENLABS_AGENT_ID
  // are absent or placeholders, the stub is used.
  return stubMode.elevenlabs ? elevenLabsStub : elevenLabsReal;
}
