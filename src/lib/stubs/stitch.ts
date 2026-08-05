/**
 * // STUB: replace with real generation once STITCH_API_KEY is set in .env.
 *
 * Simulates Google Stitch wireframe generation. Makes NO network calls: it
 * returns a labelled placeholder SVG per requested screen, so the report's
 * wireframe section is visible and testable in dev without a key — the same
 * convention every other stub here follows (labelled preview content, clearly
 * marked as a stub). In production with a real key, real screenshots replace
 * these.
 */
import type {
  GeneratedWireframe,
  StitchProvider,
  WireframeRequest,
} from '../stitch';

function placeholderSvg(label: string, device: string): Buffer {
  const isMobile = device === 'MOBILE';
  const w = isMobile ? 360 : 720;
  const h = isMobile ? 640 : 460;
  // A calm, neutral framed placeholder — a header bar, some content blocks,
  // the screen's label, and a clear "stub" marker.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(label)} — illustrative placeholder">
  <rect width="${w}" height="${h}" fill="#f4f3f0"/>
  <rect x="16" y="16" width="${w - 32}" height="${h - 32}" rx="14" fill="#ffffff" stroke="#d9d6cf"/>
  <rect x="40" y="44" width="${w - 80}" height="34" rx="8" fill="#e9e6e0"/>
  <rect x="40" y="104" width="${Math.round((w - 80) * 0.62)}" height="20" rx="6" fill="#e0ddd6"/>
  <rect x="40" y="140" width="${Math.round((w - 80) * 0.45)}" height="20" rx="6" fill="#e9e6e0"/>
  <rect x="40" y="196" width="${w - 80}" height="${isMobile ? 150 : 120}" rx="10" fill="#eeece7"/>
  <rect x="40" y="${isMobile ? 372 : 340}" width="${Math.round((w - 80) * 0.4)}" height="40" rx="20" fill="#c9c4ba"/>
  <text x="40" y="${h - 54}" font-family="monospace" font-size="15" fill="#5c574e">${escapeXml(label)}</text>
  <text x="40" y="${h - 32}" font-family="monospace" font-size="12" fill="#8a847a">Illustrative preview (stub) — ${escapeXml(device.toLowerCase())}</text>
</svg>`;
  return Buffer.from(svg, 'utf-8');
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const stitchStub: StitchProvider = {
  name: 'stitch-stub',
  isStub: true,

  async generate(requests: WireframeRequest[]): Promise<GeneratedWireframe[]> {
    return requests.map((req) => ({
      label: req.label,
      deviceType: req.deviceType,
      image: placeholderSvg(req.label, req.deviceType),
      mime: 'image/svg+xml',
      stub: true,
    }));
  },
};
