/**
 * Server-side Supabase access. All data operations go through the RPCs
 * defined in supabase/migrations/ — no direct table reads/writes exist
 * (tables are RLS-locked with zero policies).
 *
 * Three access levels:
 *  - rpc():        anonymous RPCs (submit_lead, get_recommendation, …)
 *  - userRpc():    RPCs that read auth.uid() — called with the visitor's JWT
 *  - internalRpc(): server-only RPCs — the INTERNAL_API_SECRET is passed as
 *                   the p_secret argument and checked in-database against a
 *                   stored sha256 hash.
 */
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import { requireEnv, realEnv } from './env';

function baseClient(accessToken?: string): SupabaseClient {
  const url = requireEnv('SUPABASE_URL');
  const anonKey = requireEnv('SUPABASE_ANON_KEY');
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    ...(accessToken
      ? { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
      : {}),
  });
}

export class RpcError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

async function callRpc<T>(
  client: SupabaseClient,
  fn: string,
  args: Record<string, unknown>
): Promise<T> {
  const { data, error } = await client.rpc(fn, args);
  if (error) {
    // Map the common in-database error codes onto HTTP statuses. 42501 and
    // 22023/22001 carry our own curated RAISE messages, so they're safe to
    // surface. Anything else is an unexpected DB error whose message may leak
    // schema internals (constraint names, columns), so it is logged and
    // replaced with a generic message.
    if (error.code === '42501') throw new RpcError(error.message, 403);
    if (error.code === '22023' || error.code === '22001') {
      throw new RpcError(error.message, 400);
    }
    console.error(`[rpc:${fn}] ${error.code}: ${error.message}`);
    throw new RpcError('request could not be processed', 500);
  }
  return data as T;
}

/** Anonymous RPC. */
export function rpc<T>(fn: string, args: Record<string, unknown> = {}): Promise<T> {
  return callRpc<T>(baseClient(), fn, args);
}

/** RPC executed as the signed-in user (auth.uid() resolves in-database). */
export function userRpc<T>(
  accessToken: string,
  fn: string,
  args: Record<string, unknown> = {}
): Promise<T> {
  return callRpc<T>(baseClient(accessToken), fn, args);
}

/** Server-only RPC, gated in-database on the internal secret. */
export function internalRpc<T>(
  fn: string,
  args: Record<string, unknown> = {}
): Promise<T> {
  const secret = requireEnv('INTERNAL_API_SECRET');
  return callRpc<T>(baseClient(), fn, { ...args, p_secret: secret });
}

/** Resolve the user from a request's Authorization: Bearer token, or null. */
export async function getUserFromRequest(request: Request): Promise<{
  user: User;
  token: string;
} | null> {
  const header = request.headers.get('authorization') ?? '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) return null;
  const token = match[1];
  const { data, error } = await baseClient().auth.getUser(token);
  if (error || !data.user) return null;
  return { user: data.user, token };
}

/** Constant-time check of the internal-secret header for internal routes.
 *  Uses realEnv, so a placeholder INTERNAL_API_SECRET is treated as absent
 *  and the gate fails CLOSED rather than accepting the committed template
 *  value as a valid header. */
export async function internalSecretOk(request: Request): Promise<boolean> {
  const given = request.headers.get('x-internal-secret') ?? '';
  const expected = realEnv('INTERNAL_API_SECRET') ?? '';
  if (!expected || given.length === 0) return false;
  const { timingSafeEqual, createHash } = await import('node:crypto');
  // Hash both sides first so lengths always match for timingSafeEqual.
  const a = createHash('sha256').update(given).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}
