/**
 * // STUB: replace with real call once ELEVENLABS_API_KEY,
 * // ELEVENLABS_AGENT_ID and ELEVENLABS_PHONE_NUMBER_ID are set in .env —
 * // see docs/wiring-checklist.md.
 *
 * Simulates a successful ElevenLabs outbound-call trigger. Makes NO network
 * calls of any kind — placing a real call is explicitly forbidden until the
 * real integration is wired AND verified with a supervised test call (the
 * HARD RELEASE GATE).
 */
import type { TriggerCallInput, TriggeredCall, VoiceProvider } from '../voice';

export const elevenLabsStub: VoiceProvider = {
  name: 'elevenlabs-stub',
  isStub: true,

  // STUB: replace with real call once ELEVENLABS_API_KEY / ELEVENLABS_AGENT_ID
  // / ELEVENLABS_PHONE_NUMBER_ID are set. The real implementation lives in
  // src/lib/providers/elevenlabs.ts.
  async triggerOutboundCall(_input: TriggerCallInput): Promise<TriggeredCall> {
    return {
      providerCallId: `call_stub_${crypto.randomUUID().replaceAll('-', '').slice(0, 14)}`,
      stub: true,
    };
  },
};
