-- ============================================================================
-- Paywall (founder decision 2026-07-08): the walk + preliminary read are
-- free; SCHEDULING THE FIRST CALL is payment-gated. One payment buys the
-- screening package: AI screening calls + expert screening calls + the final
-- audit report. Implementation afterwards is a retainer (sold manually).
--
-- The package purchase reuses the verified bookings/payments trust path
-- (HMAC webhook, atomic capture): a bookings row with kind =
-- 'screening_package' IS the purchase; webhook capture flips it to 'paid'.
-- Applied to project kxbcltelawavlynrdrsm on 2026-07-08 via MCP.
-- ============================================================================

alter table public.bookings add column if not exists kind text not null default 'legacy'
  check (kind in ('legacy','screening_package'));

-- Start (or resume) a package purchase for the signed-in member.
create or replace function public.purchase_screening_package()
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  -- Already active? Nothing to buy twice.
  select id into v_id from public.bookings
  where user_id = auth.uid() and kind = 'screening_package'
    and status in ('paid','call_scheduled','call_complete')
  limit 1;
  if v_id is not null then
    return jsonb_build_object('booking_id', v_id, 'already_active', true);
  end if;

  -- Pending purchase? Reuse it (a fresh order can be attached).
  select id into v_id from public.bookings
  where user_id = auth.uid() and kind = 'screening_package'
    and status = 'pending_payment'
  order by created_at desc limit 1;
  if v_id is not null then
    return jsonb_build_object('booking_id', v_id, 'already_active', false, 'resumed', true);
  end if;

  insert into public.bookings (user_id, selections, call_plan, consent_call, kind)
  values (auth.uid(), '["screening-package"]'::jsonb, 'single', true, 'screening_package')
  returning id into v_id;
  insert into public.funnel_events (stage, booking_id)
  values ('package_purchase_started', v_id);
  return jsonb_build_object('booking_id', v_id, 'already_active', false, 'resumed', false);
end;
$$;
revoke execute on function public.purchase_screening_package() from public;
grant execute on function public.purchase_screening_package() to authenticated;

-- Package state for the dashboard.
create or replace function public.my_package()
returns jsonb
language sql stable security definer
set search_path = public
as $$
  select jsonb_build_object(
    'active', exists (
      select 1 from public.bookings b
      where b.user_id = auth.uid() and b.kind = 'screening_package'
        and b.status in ('paid','call_scheduled','call_complete')
    ),
    'pending_booking_id', (
      select b.id from public.bookings b
      where b.user_id = auth.uid() and b.kind = 'screening_package'
        and b.status = 'pending_payment'
      order by b.created_at desc limit 1
    )
  );
$$;
revoke execute on function public.my_package() from public;
grant execute on function public.my_package() to authenticated;

-- THE GATE: scheduling requires an active package.
create or replace function public.schedule_screening(
  p_walk_id uuid, p_phone text, p_scheduled_at timestamptz
)
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_phone text := nullif(trim(coalesce(p_phone,'')), '');
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.bookings b
    where b.user_id = auth.uid() and b.kind = 'screening_package'
      and b.status in ('paid','call_scheduled','call_complete')
  ) then
    raise exception 'the screening package is required before scheduling — unlock it from your dashboard' using errcode = '42501';
  end if;
  if v_phone is null or v_phone !~ '^\+?[0-9][0-9 ()\-]{6,20}$' then
    raise exception 'a valid phone number is required for the screening call' using errcode = '22023';
  end if;
  if p_walk_id is not null and not exists (
    select 1 from public.walks w where w.id = p_walk_id and w.user_id = auth.uid()
  ) then
    raise exception 'walk not found or not yours' using errcode = '42501';
  end if;
  insert into public.screenings (user_id, walk_id, phone, scheduled_at)
  values (auth.uid(), p_walk_id, v_phone, coalesce(p_scheduled_at, now()))
  returning id into v_id;
  insert into public.funnel_events (stage, meta)
  values ('screening_scheduled', jsonb_build_object('screening_id', v_id, 'walk_id', p_walk_id));
  return jsonb_build_object('screening_id', v_id, 'scheduled_at', coalesce(p_scheduled_at, now()));
end;
$$;
