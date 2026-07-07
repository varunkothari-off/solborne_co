/**
 * First-layer, in-memory fixed-window rate limiter.
 *
 * Caps how many times one client (keyed by IP) can hit an endpoint in a time
 * window — so a bot can't spam thousands of fake leads or hammer an endpoint.
 *
 * LIMITATION (documented on purpose, see docs/go-live-checklist.md): this
 * counter lives in the process's memory, so it resets on restart and is NOT
 * shared across multiple server instances. It is a real, useful first layer
 * for a single node server; before serious ad traffic, put a shared limiter
 * in front (platform WAF / edge rate limiting, or a Redis/Postgres-backed
 * counter). Supabase already rate-limits the auth OTP emails independently.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
let lastSweep = 0;

/** Drop expired buckets occasionally so the map can't grow unbounded. */
function sweep(now: number): void {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  /** Seconds until the window resets (for a Retry-After header). */
  retryAfter: number;
  remaining: number;
}

/**
 * @param key    stable identifier for the caller (e.g. `leads:<ip>`)
 * @param limit  max requests allowed per window
 * @param windowMs  window length in ms
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0, remaining: limit - 1 };
  }

  if (existing.count >= limit) {
    return {
      ok: false,
      retryAfter: Math.ceil((existing.resetAt - now) / 1000),
      remaining: 0,
    };
  }

  existing.count += 1;
  return { ok: true, retryAfter: 0, remaining: limit - existing.count };
}

/** Best-effort client IP: the node adapter's clientAddress, else XFF/real-ip. */
export function clientKey(
  clientAddress: string | undefined,
  request: Request,
  scope: string
): string {
  const xff = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = clientAddress || xff || request.headers.get('x-real-ip') || 'unknown';
  return `${scope}:${ip}`;
}

/** Ready-made 429 response with a Retry-After header. */
export function tooManyRequests(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({ error: 'too many requests — please slow down' }),
    {
      status: 429,
      headers: {
        'content-type': 'application/json',
        'retry-after': String(result.retryAfter),
      },
    }
  );
}
