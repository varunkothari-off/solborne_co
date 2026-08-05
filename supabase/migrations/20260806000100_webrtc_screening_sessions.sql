-- ============================================================================
-- WebRTC screening sessions (2026-08-06): the screening call moves from a
-- Twilio outbound phone call to a live in-browser ElevenLabs WebRTC session.
-- No phone number, no scheduled call time — once the package is paid, the
-- member presses "Start now" and talks to the agent in the app.
--
--  * screenings.phone becomes nullable (WebRTC sessions have no number).
--  * begin_screening_session: THE GATE, reserve_call-style — the active-
--    package check runs atomically with inserting the screenings row, BEFORE
--    any ElevenLabs token is minted. Same paywall predicate as
--    schedule_screening (which stays for any stored future-dated records).
--  * mark_screening_session_failed: compensating action when the token mint
--    fails — the row is cancelled instead of lingering as 'scheduled'.
--  * mark_screening_triggered (unchanged, 20260707001000) attaches the
--    conversation_id: each session gets its OWN screenings row, so every
--    conversation_id stays resolvable when the post-call webhook arrives.
-- Applied to project kxbcltelawavlynrdrsm on 2026-08-06 via MCP.
-- ============================================================================

alter table public.screenings alter column phone drop not null;

-- Start a live screening session for the signed-in member. Reuses an orphan
-- 'scheduled' row (a previous mint that failed mid-flight) rather than
-- stacking new ones; otherwise inserts. Returns the lead's name from the
-- walk contact for the agent's greeting dynamic variable.
create or replace function public.begin_screening_session(p_walk_id uuid)
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_lead_name text;
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

  if p_walk_id is not null and not exists (
    select 1 from public.walks w where w.id = p_walk_id and w.user_id = auth.uid()
  ) then
    raise exception 'walk not found or not yours' using errcode = '42501';
  end if;

  select w.contact->>'name' into v_lead_name
  from public.walks w where w.id = p_walk_id;

  select s.id into v_id from public.screenings s
  where s.user_id = auth.uid() and s.status = 'scheduled'
    and s.walk_id is not distinct from p_walk_id
  order by s.created_at desc limit 1;

  if v_id is null then
    insert into public.screenings (user_id, walk_id, phone, scheduled_at)
    values (auth.uid(), p_walk_id, null, now())
    returning id into v_id;
    insert into public.funnel_events (stage, meta)
    values ('screening_session_started', jsonb_build_object('screening_id', v_id, 'walk_id', p_walk_id));
  end if;

  return jsonb_build_object('screening_id', v_id, 'lead_name', v_lead_name);
end;
$$;
revoke execute on function public.begin_screening_session(uuid) from public;
grant execute on function public.begin_screening_session(uuid) to authenticated;

-- Token mint failed: cancel the reserved row so it can't be mistaken for a
-- session that ever went live. (Mirrors mark_call_failed for bookings.)
create or replace function public.mark_screening_session_failed(p_secret text, p_screening_id uuid)
returns void
language plpgsql security definer
set search_path = public, extensions, private
as $$
begin
  if not public.internal_ok(p_secret) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  update public.screenings set status = 'cancelled'
  where id = p_screening_id and status = 'scheduled';
end;
$$;
grant execute on function public.mark_screening_session_failed(text, uuid) to anon, authenticated;
