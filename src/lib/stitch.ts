/**
 * Stitch provider seam (report wireframes). Every caller goes through
 * stitchProvider() — the same interface a real Google Stitch integration
 * uses — so going live is a key-paste plus src/lib/providers/stitch.ts.
 *
 * This is the SAME shape as the STT (src/lib/stt.ts) and voice
 * (src/lib/voice.ts) seams: a real implementation, a zero-network stub used
 * when STITCH_API_KEY is absent/placeholder, and one provider() picker. So
 * it behaves like every other integration here, including working fine in dev
 * with no key.
 *
 * ADDITIVE, NEVER A HARD DEPENDENCY: wireframes are a report add-on. When the
 * key is absent the stub returns labelled placeholder screens (zero network),
 * and if generation ever fails the report still renders fully without images
 * (see src/lib/wireframes.ts). The whole feature disables with the env var.
 */
import { stubMode } from './env';
import { stitchStub } from './stubs/stitch';
import { stitchReal } from './providers/stitch';

/** MOBILE => an app screen; DESKTOP => a website screen. */
export type WireframeDevice = 'MOBILE' | 'DESKTOP';

export interface WireframeRequest {
  /** Short human label shown under the image, e.g. "Home screen". */
  label: string;
  /** The text prompt Stitch turns into a screen. */
  prompt: string;
  deviceType: WireframeDevice;
}

export interface GeneratedWireframe {
  label: string;
  deviceType: WireframeDevice;
  /** Raw image bytes (downloaded from Stitch, or produced by the stub). */
  image: Buffer;
  mime: string;
  /** true when produced by the stub — surfaced in the report UI. */
  stub: boolean;
}

export interface StitchProvider {
  readonly name: string;
  readonly isStub: boolean;
  /** Generate one screen per request. Implementations should be resilient:
      a single screen failing should not sink the others. */
  generate(requests: WireframeRequest[]): Promise<GeneratedWireframe[]>;
}

export function stitchProvider(): StitchProvider {
  // STUB SELECTION: while STITCH_API_KEY is absent or a placeholder, the stub
  // is used — no network, labelled placeholder screens.
  return stubMode.stitch ? stitchStub : stitchReal;
}
