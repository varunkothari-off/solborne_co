-- ============================================================================
-- Hardening pass (addresses onboarding security review, 2026-07-07). Applied
-- to project kxbcltelawavlynrdrsm via MCP; kept here for versioning.
--  * record_payment_captured: the payments UPDATE is the atomic first-capture
--    gate (row-count), so concurrent duplicate webhooks can't both fire a call.
--  * reserve_call/attach_provider_call_id/mark_call_failed replace create_call:
--    the DB paid-gate runs BEFORE any outbound provider call.
--  * set_expert_availability(uuid, boolean): ownership is part of the UPDATE
--    predicate, so a mismatched id never mutates the caller's own row.
--  * cancel_booking: compensating action if order creation fails mid-booking.
-- ============================================================================

create or replace function public.record_payment_captured(
  p_secret text, p_order_id text, p_payment_id text, p_raw jsonb
)
returns jsonb
language plpgsql security definer
set search_path = public, extensions, private
as $$
declare
  v_booking uuid;
  v_updated integer;
begin
  if not public.internal_ok(p_secret) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  select booking_id into v_booking from public.payments where order_id = p_order_id;
  if v_booking is null then
    raise exception 'unknown order' using errcode = '22023';
  end if;

  update public.payments
  set status = 'captured', payment_id = p_payment_id, raw_event = p_raw
  where order_id = p_order_id and status <> 'captured';
  get diagnostics v_updated = row_count;
  if v_updated = 0 then
    return jsonb_build_object('booking_id', v_booking, 'already_captured', true);
  end if;

  update public.bookings set status = 'paid'
  where id = v_booking and status = 'pending_payment';

  insert into public.funnel_events (stage, booking_id) values ('payment_captured', v_booking);
  return jsonb_build_object('booking_id', v_booking, 'already_captured', false);
end;
$$;

create or replace function public.reserve_call(p_secret text, p_booking_id uuid)
returns uuid
language plpgsql security definer
set search_path = public, extensions, private
as $$
declare
  v_id uuid;
  v_updated integer;
begin
  if not public.internal_ok(p_secret) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  update public.bookings set status = 'call_scheduled'
  where id = p_booking_id and status = 'paid';
  get diagnostics v_updated = row_count;
  if v_updated = 0 then
    raise exception 'call refused: booking is not in paid status' using errcode = '42501';
  end if;
  insert into public.calls (booking_id) values (p_booking_id) returning id into v_id;
  insert into public.funnel_events (stage, booking_id) values ('call_triggered', p_booking_id);
  return v_id;
end;
$$;

create or replace function public.attach_provider_call_id(
  p_secret text, p_call_id uuid, p_provider_call_id text
)
returns void
language plpgsql security definer
set search_path = public, extensions, private
as $$
begin
  if not public.internal_ok(p_secret) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  update public.calls set provider_call_id = p_provider_call_id where id = p_call_id;
end;
$$;

create or replace function public.mark_call_failed(p_secret text, p_call_id uuid)
returns void
language plpgsql security definer
set search_path = public, extensions, private
as $$
declare
  v_booking uuid;
begin
  if not public.internal_ok(p_secret) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  select booking_id into v_booking from public.calls where id = p_call_id;
  update public.calls set status = 'failed' where id = p_call_id;
  update public.bookings set status = 'paid'
  where id = v_booking and status = 'call_scheduled';
end;
$$;

create or replace function public.set_expert_availability(
  p_expert_id uuid, p_available boolean
)
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
  update public.experts set available = coalesce(p_available, true)
  where user_id = auth.uid() and id = p_expert_id
  returning id into v_id;
  if v_id is null then
    raise exception 'not your expert profile' using errcode = '42501';
  end if;
  return jsonb_build_object('expert_id', v_id, 'available', coalesce(p_available, true));
end;
$$;

create or replace function public.cancel_booking(p_secret text, p_booking_id uuid)
returns void
language plpgsql security definer
set search_path = public, extensions, private
as $$
begin
  if not public.internal_ok(p_secret) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  update public.bookings set status = 'cancelled'
  where id = p_booking_id and status = 'pending_payment';
end;
$$;

revoke execute on function public.set_expert_availability(boolean) from anon, authenticated;
grant execute on function public.set_expert_availability(uuid, boolean) to authenticated;
grant execute on function public.reserve_call(text, uuid) to anon, authenticated;
grant execute on function public.attach_provider_call_id(text, uuid, text) to anon, authenticated;
grant execute on function public.mark_call_failed(text, uuid) to anon, authenticated;
grant execute on function public.cancel_booking(text, uuid) to anon, authenticated;
