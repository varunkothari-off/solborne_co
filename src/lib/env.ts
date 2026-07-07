/**
 * Server-side environment access with placeholder detection.
 *
 * .env was seeded from .env.example, so unset services still carry template
 * placeholder values ("your-…", "rzp_test_xxxx…"). A placeholder is treated
 * as ABSENT: it activates the stub provider for that service instead of ever
 * being sent to a real API.
 *
 * Reads import.meta.env first (dev / build-time) and falls back to
 * process.env (running the built node server, e.g.
 * `node --env-file=.env ./dist/server/entry.mjs`).
 */

const PLACEHOLDER_PATTERNS = [
  /^your-/i,
  /^https:\/\/your-project-ref/i,
  /^rzp_test_x+$/i,
  /^sk_test_x+$/i,
  /^pk_test_x+$/i,
  /^whsec_x+$/i,
  /^sk-ant-x+$/i,
  /^generate-a-long-random/i,
];

export function envVar(name: string): string | undefined {
  const fromMeta = (import.meta.env as Record<string, string | undefined>)[name];
  const fromProcess =
    typeof process !== 'undefined' ? process.env?.[name] : undefined;
  const value = (fromMeta ?? fromProcess)?.trim();
  return value === '' ? undefined : value;
}

export function isPlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  return PLACEHOLDER_PATTERNS.some((re) => re.test(value));
}

/** The value, or undefined when unset OR still the template placeholder. */
export function realEnv(name: string): string | undefined {
  const value = envVar(name);
  return isPlaceholder(value) ? undefined : value;
}

/** Required var: throws with a pointer to the checklist when missing. */
export function requireEnv(name: string): string {
  const value = realEnv(name);
  if (!value) {
    throw new Error(
      `Missing required env var ${name} — see docs/wiring-checklist.md`
    );
  }
  return value;
}

/** Stub-mode flags: true while the service's keys are absent/placeholders. */
export const stubMode = {
  get razorpay(): boolean {
    return !realEnv('RAZORPAY_KEY_ID') || !realEnv('RAZORPAY_KEY_SECRET');
  },
  get elevenlabs(): boolean {
    return (
      !realEnv('ELEVENLABS_API_KEY') ||
      !realEnv('ELEVENLABS_AGENT_ID') ||
      !realEnv('ELEVENLABS_PHONE_NUMBER_ID')
    );
  },
};

/** Discovery-call order amount in paise. LEGACY (/book flow only). */
export function discoveryCallAmountPaise(): number {
  const raw = envVar('DISCOVERY_CALL_AMOUNT_PAISE');
  const n = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : 99900;
}

/**
 * The screening package price — Phase-0 fair-pricing research: USD-first at
 * $1,497 flat (the "AI Opportunity Audit" band, ~40-55% under the $2,000-
 * $3,500 market low end). One payment covers the AI screening calls, expert
 * screening calls, and the final audit report. INR storefront (₹9,900)
 * comes later per the research's geo-gated sequencing.
 */
export function screeningPackagePrice(): {
  amountMinor: number;
  currency: string;
  display: string;
} {
  const rawAmount = envVar('SCREENING_PACKAGE_AMOUNT_MINOR');
  const parsed = rawAmount ? Number.parseInt(rawAmount, 10) : NaN;
  const amountMinor = Number.isFinite(parsed) && parsed > 0 ? parsed : 149700;
  const currency = (envVar('SCREENING_PACKAGE_CURRENCY') || 'USD').toUpperCase();
  const major = amountMinor / 100;
  const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : `${currency} `;
  const display = `${symbol}${major.toLocaleString('en-US', {
    minimumFractionDigits: major % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
  return { amountMinor, currency, display };
}
