/**
 * REAL ElevenLabs integration — intentionally NOT implemented yet: no real
 * key exists, and placing a real outbound call is explicitly forbidden until
 * the founder runs the supervised verification call (HARD RELEASE GATE).
 *
 * When the ElevenLabs env vars hold real values, voiceProvider() selects
 * THIS module. Implement triggerOutboundCall() below (reference
 * implementation in the comment), following docs/wiring-checklist.md.
 * Until implemented it fails loudly rather than pretending.
 */
import type { TriggerCallInput, TriggeredCall, VoiceProvider } from '../voice';

export const elevenLabsReal: VoiceProvider = {
  name: 'elevenlabs',
  isStub: false,

  async triggerOutboundCall(_input: TriggerCallInput): Promise<TriggeredCall> {
    throw new Error(
      'Real ElevenLabs keys are set but the real provider is not implemented yet — ' +
        'complete src/lib/providers/elevenlabs.ts (see docs/wiring-checklist.md).'
    );
    /* Reference implementation (verify against current ElevenLabs docs first):
    const apiKey = requireEnv('ELEVENLABS_API_KEY');
    const agentId = requireEnv('ELEVENLABS_AGENT_ID');
    const phoneNumberId = requireEnv('ELEVENLABS_PHONE_NUMBER_ID');
    // The destination number is now captured on the booking and passed in.
    if (!_input.toNumber) throw new Error('no destination number on booking');
    const res = await fetch('https://api.elevenlabs.io/v1/convai/twilio/outbound-call', {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'content-type': 'application/json' },
      body: JSON.stringify({
        agent_id: agentId,
        agent_phone_number_id: phoneNumberId,
        to_number: _input.toNumber,
        conversation_initiation_client_data: {
          dynamic_variables: { booking_id: _input.bookingId, lead_name: _input.toName ?? '' },
        },
      }),
    });
    if (!res.ok) throw new Error(`ElevenLabs call trigger failed: ${res.status}`);
    const data = await res.json();
    return { providerCallId: data.call_sid ?? data.conversation_id, stub: false };
    */
  },
};
