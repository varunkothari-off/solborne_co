/**
 * // STUB: replace with real session minting once ELEVENLABS_API_KEY_AGENT
 * // and ELEVENLABS_AGENT_ID are set in .env — see docs/wiring-checklist.md.
 *
 * Simulates a successful ElevenLabs WebRTC token mint. Makes NO network
 * calls of any kind — the returned token is fake, so the browser UI shows a
 * simulated session instead of connecting. Opening a real live session is
 * explicitly forbidden until the real integration is wired AND verified
 * with a supervised, talked-through browser session (the HARD RELEASE GATE).
 */
import type { CreateSessionInput, WebRtcSession, VoiceProvider } from '../voice';

export const elevenLabsStub: VoiceProvider = {
  name: 'elevenlabs-stub',
  isStub: true,

  // STUB: replace with real session minting once ELEVENLABS_API_KEY_AGENT /
  // ELEVENLABS_AGENT_ID are set. The real implementation lives in
  // src/lib/providers/elevenlabs.ts.
  async createWebRtcSession(_input: CreateSessionInput): Promise<WebRtcSession> {
    const rand = crypto.randomUUID().replaceAll('-', '').slice(0, 14);
    return {
      token: `webrtc_stub_token_${rand}`,
      conversationId: `conv_stub_${rand}`,
      stub: true,
    };
  },
};
