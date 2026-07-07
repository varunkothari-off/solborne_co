-- Phone capture for the outbound discovery call. Stored on the booking; the
-- real ElevenLabs provider needs it to dial (the stub never did, which is why
-- it wasn't modelled originally). E.164-ish, validated in the app layer too.
-- Applied to project kxbcltelawavlynrdrsm via MCP; kept here for versioning.
alter table public.bookings add column if not exists phone text;

create or replace function public.create_booking(
  p_lead_id uuid, p_selections jsonb, p_call_plan text, p_consent boolean, p_phone text
)
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_phone text := nullif(trim(coalesce(p_phone, '')), '');
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if not coalesce(p_consent, false) then
    raise exception 'explicit consent to the automated call is required' using errcode = '22023';
  end if;
  if p_call_plan not in ('single', 'split') then
    raise exception 'invalid call plan' using errcode = '22023';
  end if;
  if v_phone is null or v_phone !~ '^\+?[0-9][0-9 ()\-]{6,20}$' then
    raise exception 'a valid phone number is required for the discovery call' using errcode = '22023';
  end if;
  if jsonb_typeof(p_selections) is distinct from 'array'
     or jsonb_array_length(p_selections) < 1
     or jsonb_array_length(p_selections) > 10
     or pg_column_size(p_selections) > 4000 then
    raise exception 'selections must be a list of 1-10 workflows' using errcode = '22023';
  end if;

  insert into public.bookings (lead_id, user_id, selections, call_plan, consent_call, phone)
  values (p_lead_id, auth.uid(), p_selections, p_call_plan, true, v_phone)
  returning id into v_id;

  insert into public.funnel_events (stage, lead_id, booking_id)
  values ('booking_created', p_lead_id, v_id);

  return jsonb_build_object('booking_id', v_id);
end;
$$;

revoke execute on function public.create_booking(uuid, jsonb, text, boolean) from anon, authenticated;
grant execute on function public.create_booking(uuid, jsonb, text, boolean, text) to authenticated;

create or replace function public.get_booking_phone(p_secret text, p_booking_id uuid)
returns text
language plpgsql stable security definer
set search_path = public, extensions, private
as $$
declare
  v_phone text;
begin
  if not public.internal_ok(p_secret) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  select phone into v_phone from public.bookings where id = p_booking_id;
  return v_phone;
end;
$$;
revoke execute on function public.get_booking_phone(text, uuid) from public, anon, authenticated;
grant execute on function public.get_booking_phone(text, uuid) to anon, authenticated;
