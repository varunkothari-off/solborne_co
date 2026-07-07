-- ============================================================================
-- Stripe-swap hardening (adversarial review, 2026-07-08). Applied to
-- kxbcltelawavlynrdrsm via MCP.
--  * record_payment_captured: the BOOKING transition (pending->paid) is the
--    real "first payment" gate. Only the payment that flips it counts as
--    unlocking; any OTHER captured payment for an already-paid booking is a
--    DUPLICATE charge — flagged for refund, never double-unlocks.
--  * purchase_screening_package: returns the existing pending order id so the
--    route can REUSE the open Checkout Session instead of minting a second
--    payable one (prevents the double charge at the source).
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
  v_pay_updated integer;
  v_book_updated integer;
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
  get diagnostics v_pay_updated = row_count;
  if v_pay_updated = 0 then
    return jsonb_build_object('booking_id', v_booking, 'already_captured', true);
  end if;

  update public.bookings set status = 'paid'
  where id = v_booking and status = 'pending_payment';
  get diagnostics v_book_updated = row_count;
  if v_book_updated = 0 then
    insert into public.funnel_events (stage, booking_id, meta)
    values (
      'duplicate_payment_captured', v_booking,
      jsonb_build_object('order_id', p_order_id, 'payment_id', p_payment_id, 'needs_refund', true)
    );
    return jsonb_build_object('booking_id', v_booking, 'already_captured', true, 'duplicate', true);
  end if;

  insert into public.funnel_events (stage, booking_id) values ('payment_captured', v_booking);
  return jsonb_build_object('booking_id', v_booking, 'already_captured', false);
end;
$$;

create or replace function public.purchase_screening_package()
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_pending_order text;
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select id into v_id from public.bookings
  where user_id = auth.uid() and kind = 'screening_package'
    and status in ('paid','call_scheduled','call_complete')
  limit 1;
  if v_id is not null then
    return jsonb_build_object('booking_id', v_id, 'already_active', true);
  end if;

  select id into v_id from public.bookings
  where user_id = auth.uid() and kind = 'screening_package'
    and status = 'pending_payment'
  order by created_at desc limit 1;
  if v_id is not null then
    select order_id into v_pending_order from public.payments
    where booking_id = v_id and status = 'created'
    order by created_at desc limit 1;
    return jsonb_build_object(
      'booking_id', v_id, 'already_active', false, 'resumed', true,
      'pending_order_id', v_pending_order
    );
  end if;

  insert into public.bookings (user_id, selections, call_plan, consent_call, kind)
  values (auth.uid(), '["screening-package"]'::jsonb, 'single', true, 'screening_package')
  returning id into v_id;
  insert into public.funnel_events (stage, booking_id)
  values ('package_purchase_started', v_id);
  return jsonb_build_object('booking_id', v_id, 'already_active', false, 'resumed', false);
end;
$$;
