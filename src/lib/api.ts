/** Small helpers shared by the API routes. */
import { RpcError } from './supabase';

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export function errorResponse(err: unknown): Response {
  if (err instanceof RpcError) {
    return json({ error: err.message }, err.status);
  }
  console.error('[api] unexpected error:', err);
  return json({ error: 'internal error' }, 500);
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string | undefined): value is string {
  return !!value && UUID_RE.test(value);
}

/** Parse a JSON body with a byte-size cap; returns null on bad input. */
export async function readJson(
  request: Request,
  maxBytes = 32_000
): Promise<unknown | null> {
  try {
    const raw = await request.text();
    if (raw.length > maxBytes) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
