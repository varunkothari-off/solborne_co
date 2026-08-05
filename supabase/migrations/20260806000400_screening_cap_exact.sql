-- ============================================================================
-- Make the per-package session cap exact under concurrency (2026-08-06,
-- verification follow-up). The count-then-insert in 20260806000200 was
-- non-atomic: N parallel starts could each read consumed < cap and all pass,
-- overshooting the ceiling by the concurrency width.
--
-- Fix: a per-user transaction advisory lock serialises a member's concurrent
-- begins, and the count now also includes freshly-inserted 'scheduled' rows
-- (a session in flight) — bounded to a 15-minute window so an orphaned
-- 'scheduled' row (process died before mint) frees its slot rather than
-- consuming it forever. 'cancelled' rows (failed/withheld mints) never count,
-- so a genuine failure immediately frees the slot for a retry.
-- Applied to project kxbcltelawavlynrdrsm on 2026-08-06 via MCP.
-- ============================================================================

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

  -- Serialise this member's concurrent starts so the cap can't be raced.
  perform pg_advisory_xact_lock(hashtext('screening:' || auth.uid()::text));

  if not exists (
    select 1 from public.bookings b
    where b.user_id = auth.uid() and b.kind = 'screening_package'
      and b.status in ('paid','call_scheduled','call_complete')
  ) then
    raise exception 'the screening package is required before the call — unlock it from your dashboard' using errcode = '42501';
  end if;

  if p_max_sessions is not null then
    select count(*) into v_consumed from public.screenings s
    where s.user_id = auth.uid()
      and (
        s.status in ('triggered','completed')
        or (s.status = 'scheduled' and s.created_at > now() - interval '15 minutes')
      );
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
