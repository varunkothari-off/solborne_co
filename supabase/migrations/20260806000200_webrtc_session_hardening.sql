-- ============================================================================
-- WebRTC screening hardening (2026-08-06, adversarial review follow-up).
-- Fixes three confirmed defects in 20260806000100 / the WebRTC rewrite:
--
--  (A) Shared-row race + silent correlation loss. begin_screening_session
--      reused an orphan 'scheduled' row via a bare SELECT (no lock), so two
--      concurrent starts could share one row: both minted real tokens, but
--      only one conversation_id could be stored — the other conversation ran
--      live with its id stored NOWHERE, so its post-call webhook could never
--      resolve. Fix: each start ALWAYS inserts its own row (the invariant the
--      original comment claimed), so no two requests ever share a row. Failed
--      mints leave a 'cancelled' row (harmless record), never reused.
--
--  (B) mark_screening_triggered was `returns void` and reported nothing, so a
--      0-row update (row not 'scheduled') was indistinguishable from success
--      and the route returned the token anyway. Now returns boolean; the
--      route withholds the token and cancels when the attach didn't land.
--
--  (C) One paid package granted UNLIMITED live agent sessions — the gate was
--      a pure existence test that never consumed anything. Added a per-user
--      session cap (p_max_sessions, supplied server-side from env), counting
--      sessions that actually consumed a mint (status in triggered/completed).
--      This is an anti-abuse ceiling, NOT the deliberate product allowance —
--      the founder sets SCREENING_SESSIONS_PER_PACKAGE to the real number.
-- Applied to project kxbcltelawavlynrdrsm on 2026-08-06 via MCP.
-- ============================================================================

-- (A)+(C): always-insert + per-user cap. New signature (uuid, integer);
-- drop the old (uuid) overload so there is no ambiguity.
drop function if exists public.begin_screening_session(uuid);

create or replace function public.begin_screening_session(
  p_walk_id uuid, p_max_sessions integer
)
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_lead_name text;
  v_consumed integer;
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  -- THE PAYWALL GATE (same predicate as schedule_screening): a live session
  -- requires an active, PAID screening package. Do not weaken.
  if not exists (
    select 1 from public.bookings b
    where b.user_id = auth.uid() and b.kind = 'screening_package'
      and b.status in ('paid','call_scheduled','call_complete')
  ) then
    raise exception 'the screening package is required before the call — unlock it from your dashboard' using errcode = '42501';
  end if;

  -- Anti-abuse ceiling: bound how many real agent sessions one package can
  -- mint. Counts only sessions that actually consumed a mint.
  if p_max_sessions is not null then
    select count(*) into v_consumed from public.screenings s
    where s.user_id = auth.uid() and s.status in ('triggered','completed');
    if v_consumed >= p_max_sessions then
      raise exception 'your screening-call allowance for this package is used up — write to us to extend it' using errcode = '42501';
    end if;
  end if;

  if p_walk_id is not null and not exists (
    select 1 from public.walks w where w.id = p_walk_id and w.user_id = auth.uid()
  ) then
    raise exception 'walk not found or not yours' using errcode = '42501';
  end if;

  select w.contact->>'name' into v_lead_name
  from public.walks w where w.id = p_walk_id;

  -- ALWAYS a fresh row: each session owns its own row and its own
  -- conversation_id, so concurrent starts can never share correlation state.
  insert into public.screenings (user_id, walk_id, phone, scheduled_at)
  values (auth.uid(), p_walk_id, null, now())
  returning id into v_id;
  insert into public.funnel_events (stage, meta)
  values ('screening_session_started', jsonb_build_object('screening_id', v_id, 'walk_id', p_walk_id));

  return jsonb_build_object('screening_id', v_id, 'lead_name', v_lead_name);
end;
$$;
revoke execute on function public.begin_screening_session(uuid, integer) from public;
grant execute on function public.begin_screening_session(uuid, integer) to authenticated;

-- (B): report whether the attach landed, so the route can fail closed.
-- (Return type changes void -> boolean, so the old overload is dropped first.)
drop function if exists public.mark_screening_triggered(text, uuid, text);

create or replace function public.mark_screening_triggered(
  p_secret text, p_screening_id uuid, p_provider_call_id text
)
returns boolean
language plpgsql security definer
set search_path = public, extensions, private
as $$
declare
  v_updated integer;
begin
  if not public.internal_ok(p_secret) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  update public.screenings set status = 'triggered', provider_call_id = p_provider_call_id
  where id = p_screening_id and status = 'scheduled';
  get diagnostics v_updated = row_count;
  return v_updated = 1;
end;
$$;
grant execute on function public.mark_screening_triggered(text, uuid, text) to anon, authenticated;
