/**
 * Voice provider seam (the paid discovery call). Every caller goes through
 * voiceProvider() — the same interface a real ElevenLabs integration uses —
 * so going live is a key-paste plus implementing
 * src/lib/providers/elevenlabs.ts.
 *
 * HARD RELEASE GATE: the system is NOT launch-ready until ElevenLabs is
 * verified with a real test call. Stub completeness is not the same as done.
 */
import { stubMode } from './env';
import { elevenLabsStub } from './stubs/elevenlabs';
import { elevenLabsReal } from './providers/elevenlabs';

export interface TriggerCallInput {
  bookingId: string;
  /** Lead's first name for the agent's greeting; no other PII is passed. */
  toName?: string;
}

export interface TriggeredCall {
  providerCallId: string;
  /** true when produced by the stub — surfaced to the UI so it can say so. */
  stub: boolean;
}

export interface VoiceProvider {
  readonly name: string;
  readonly isStub: boolean;
  triggerOutboundCall(input: TriggerCallInput): Promise<TriggeredCall>;
}

export function voiceProvider(): VoiceProvider {
  // STUB SELECTION: while ELEVENLABS_API_KEY / ELEVENLABS_AGENT_ID /
  // ELEVENLABS_PHONE_NUMBER_ID are absent or placeholders, the stub is used.
  return stubMode.elevenlabs ? elevenLabsStub : elevenLabsReal;
}
