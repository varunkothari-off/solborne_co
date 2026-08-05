/**
 * Report wireframe stage (orchestration). After a walk's report is generated,
 * this classifies the recommended solution's visual shape and — for an app or
 * website — asks Google Stitch for two illustrative screens (a home/landing
 * screen and one core-feature screen), stores them, and returns them for the
 * report.
 *
 * STRICTLY ADDITIVE: this never throws. A missing Stitch key, a 'none' shape,
 * a generation error, or missing storage all resolve to "no wireframes" and
 * the report renders fully without them. The report pipeline (report.ts) also
 * wraps this in a timeout so a slow Stitch call can't stall the report.
 */
import { classifySolutionShape, type ReportWireframe, type WalkReport } from './llm';
import { stitchProvider, type WireframeRequest, type WireframeDevice } from './stitch';
import { storeWalkWireframe } from './supabase';

/** The two screens we always ask for, phrased from the report. */
function buildRequests(report: WalkReport, device: WireframeDevice): WireframeRequest[] {
  const surface = device === 'MOBILE' ? 'mobile app' : 'web app';
  const top = report.matches[0];
  const focus = top ? `${top.name} — ${top.reason}` : report.headline;

  return [
    {
      label: 'Home / landing screen',
      deviceType: device,
      prompt:
        `A clean, professional home screen for a ${surface} that addresses: ` +
        `"${report.headline}". Calm, modern, business-like; clear primary action; ` +
        `no lorem ipsum — use realistic labels drawn from the problem.`,
    },
    {
      label: 'Core feature screen',
      deviceType: device,
      prompt:
        `The main working screen of that ${surface}, focused on its core feature: ` +
        `${focus}. Show the primary workflow in use — realistic content, clear layout, ` +
        `the same calm professional style as the home screen.`,
    },
  ];
}

/**
 * Generate + store the report's wireframes. Returns [] on any skip/failure.
 * @param walkId  storage partition (also the report's owner)
 * @param report  the finished report to illustrate
 */
export async function generateReportWireframes(
  walkId: string,
  report: WalkReport
): Promise<ReportWireframe[]> {
  try {
    const shape = await classifySolutionShape(report);
    if (shape === 'none') return []; // no visual shape — skip gracefully

    const device: WireframeDevice = shape === 'app' ? 'MOBILE' : 'DESKTOP';
    const requests = buildRequests(report, device);

    const generated = await stitchProvider().generate(requests);

    const out: ReportWireframe[] = [];
    for (let i = 0; i < generated.length; i += 1) {
      const g = generated[i];
      let url = await storeWalkWireframe(walkId, i, g.image, g.mime);
      // Dev with no service-role key: embed the tiny stub SVG inline so the
      // feature is still visible. Real (large) images are only skipped, never
      // inlined into the report row.
      if (!url && g.stub) {
        url = `data:${g.mime};base64,${g.image.toString('base64')}`;
      }
      if (url) {
        out.push({ label: g.label, url, deviceType: g.deviceType, stub: g.stub });
      }
    }
    return out;
  } catch (err) {
    console.warn('[wireframes] generation skipped (non-fatal):', err);
    return [];
  }
}
