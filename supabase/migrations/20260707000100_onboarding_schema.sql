-- ============================================================================
-- Solborne & Co. — Onboarding system schema (Phase 3 architecture spec)
-- Applied to project kxbcltelawavlynrdrsm on 2026-07-07 (via MCP), kept here
-- for versioning. If you rebuild the project, run this file, then the
-- follow-up grants in 20260707000200, then set the internal secret hash:
--
--   insert into private.config (key, value)
--   values ('internal_secret_hash', encode(digest('<INTERNAL_API_SECRET>', 'sha256'), 'hex'))
--   on conflict (key) do update set value = excluded.value;
--
-- Access model: NO direct table access for anon/authenticated. Every
-- operation goes through SECURITY DEFINER RPCs. Internal (server-only) RPCs
-- are gated on a shared secret whose sha256 hash lives in private.config —
-- the plaintext exists only in the app server's .env (INTERNAL_API_SECRET).
-- ============================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---- Private config (secret hash) ----
create schema if not exists private;
create table if not exists private.config (
  key text primary key,
  value text not null
);
alter table private.config enable row level security;
revoke all on schema private from anon, authenticated, public;
revoke all on private.config from anon, authenticated, public;

-- ---- Tables ----
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  firm text,
  path text,
  domains jsonb not null default '[]'::jsonb,
  role text,
  tools jsonb not null default '[]'::jsonb,
  answers jsonb not null default '{}'::jsonb,
  frequency text,
  scale text,
  matches jsonb not null default '[]'::jsonb
);

create table public.experts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid unique references auth.users (id) on delete set null,
  name text not null,
  title text,
  bio text,
  categories jsonb not null default '[]'::jsonb,
  available boolean not null default true
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lead_id uuid references public.leads (id) on delete set null,
  user_id uuid not null references auth.users (id) on delete cascade,
  selections jsonb not null default '[]'::jsonb,
  call_plan text not null check (call_plan in ('single', 'split')),
  consent_call boolean not null default false,
  status text not null default 'pending_payment'
    check (status in ('pending_payment','paid','call_scheduled','call_complete','cancelled')),
  expert_id uuid references public.experts (id) on delete set null
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  provider text not null default 'razorpay',
  order_id text not null unique,
  payment_id text,
  amount integer not null check (amount > 0),
  currency text not null default 'INR',
  status text not null default 'created' check (status in ('created','captured','failed')),
  raw_event jsonb
);

create table public.calls (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  provider_call_id text,
  status text not null default 'triggered' check (status in ('triggered','completed','failed')),
  transcript jsonb,
  routing jsonb,
  confidence numeric,
  needs_human_review boolean not null default false
);

create table public.outreach_campaigns (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'queued' check (status in ('queued','running','done','cancelled'))
);

create table public.funnel_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  stage text not null,
  lead_id uuid,
  booking_id uuid,
  meta jsonb
);

-- Deny-by-default: RLS on with no policies, plus explicit revokes.
alter table public.leads enable row level security;
alter table public.experts enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;
alter table public.calls enable row level security;
alter table public.outreach_campaigns enable row level security;
alter table public.funnel_events enable row level security;
revoke all on public.leads, public.experts, public.bookings, public.payments,
  public.calls, public.outreach_campaigns, public.funnel_events
  from anon, authenticated;

-- ---- Internal-secret check ----
create or replace function public.internal_ok(p_secret text)
returns boolean
language sql stable security definer
set search_path = public, extensions, private
as $$
  select coalesce(
    encode(extensions.digest(coalesce(p_secret, ''), 'sha256'), 'hex')
      = (select value from private.config where key = 'internal_secret_hash'),
    false
  );
$$;
revoke execute on function public.internal_ok(text) from public, anon, authenticated;

-- ---- Public RPCs (anon) ----

-- Part A: diagnostic submission. Validates shape and size; returns lead id.
create or replace function public.submit_lead(p jsonb)
returns uuid
language plpgsql security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_name text := left(trim(coalesce(p->'lead'->>'name', '')), 200);
  v_email text := left(trim(coalesce(p->'lead'->>'email', '')), 320);
begin
  if pg_column_size(p) > 20000 then
    raise exception 'payload too large' using errcode = '22001';
  end if;
  if v_name = '' or v_email = '' or position('@' in v_email) < 2 then
    raise exception 'name and a valid email are required' using errcode = '22023';
  end if;

  insert into public.leads (name, email, firm, path, domains, role, tools, answers, frequency, scale, matches)
  values (
    v_name,
    v_email,
    nullif(left(trim(coalesce(p->'lead'->>'firm', '')), 300), ''),
    left(coalesce(p->>'path', ''), 40),
    coalesce(p->'domains', '[]'::jsonb),
    left(coalesce(p->>'role', ''), 300),
    coalesce(p->'tools', '[]'::jsonb),
    coalesce(p->'answers', '{}'::jsonb),
    left(coalesce(p->>'frequency', ''), 100),
    left(coalesce(p->>'scale', ''), 100),
    coalesce(p->'matches', '[]'::jsonb)
  )
  returning id into v_id;

  insert into public.funnel_events (stage, lead_id) values ('lead_created', v_id);
  return v_id;
end;
$$;
revoke execute on function public.submit_lead(jsonb) from public;
grant execute on function public.submit_lead(jsonb) to anon, authenticated;

-- Part A: recommendation read-back. The lead uuid is the capability token;
-- returns the visitor's own answers reflected back + matches. Never email.
create or replace function public.get_recommendation(p_lead_id uuid)
returns jsonb
language sql stable security definer
set search_path = public
as $$
  select jsonb_build_object(
    'lead_id', l.id,
    'name', l.name,
    'path', l.path,
    'domains', l.domains,
    'answers', l.answers,
    'frequency', l.frequency,
    'scale', l.scale,
    'matches', l.matches
  )
  from public.leads l
  where l.id = p_lead_id;
$$;
revoke execute on function public.get_recommendation(uuid) from public;
grant execute on function public.get_recommendation(uuid) to anon, authenticated;

-- Public expert cards ("waiting on expert assignment" when empty/unset).
create or replace function public.list_experts()
returns jsonb
language sql stable security definer
set search_path = public
as $$
  select coalesce(
    jsonb_agg(jsonb_build_object(
      'id', e.id, 'name', e.name, 'title', e.title,
      'bio', e.bio, 'categories', e.categories, 'available', e.available
    ) order by e.created_at),
    '[]'::jsonb
  )
  from public.experts e;
$$;
revoke execute on function public.list_experts() from public;
grant execute on function public.list_experts() to anon, authenticated;

-- Part C reveal: booking status by capability uuid. No PII beyond the
-- public expert card.
create or replace function public.get_booking_status(p_booking_id uuid)
returns jsonb
language sql stable security definer
set search_path = public
as $$
  select jsonb_build_object(
    'booking_id', b.id,
    'status', b.status,
    'call_plan', b.call_plan,
    'payment_status', (select p.status from public.payments p where p.booking_id = b.id order by p.created_at desc limit 1),
    'call_status', (select c.status from public.calls c where c.booking_id = b.id order by c.created_at desc limit 1),
    'needs_human_review', (select c.needs_human_review from public.calls c where c.booking_id = b.id order by c.created_at desc limit 1),
    'expert', (
      select jsonb_build_object('name', e.name, 'title', e.title, 'bio', e.bio)
      from public.experts e where e.id = b.expert_id
    )
  )
  from public.bookings b
  where b.id = p_booking_id;
$$;
revoke execute on function public.get_booking_status(uuid) from public;
grant execute on function public.get_booking_status(uuid) to anon, authenticated;

-- ---- Authenticated RPCs ----

-- Part B: booking creation. Requires a signed-in user and explicit consent
-- to the automated call (spec constraint).
create or replace function public.create_booking(
  p_lead_id uuid, p_selections jsonb, p_call_plan text, p_consent boolean
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
  if not coalesce(p_consent, false) then
    raise exception 'explicit consent to the automated call is required' using errcode = '22023';
  end if;
  if p_call_plan not in ('single', 'split') then
    raise exception 'invalid call plan' using errcode = '22023';
  end if;
  if jsonb_typeof(p_selections) is distinct from 'array'
     or jsonb_array_length(p_selections) < 1
     or jsonb_array_length(p_selections) > 10
     or pg_column_size(p_selections) > 4000 then
    raise exception 'selections must be a list of 1-10 workflows' using errcode = '22023';
  end if;

  insert into public.bookings (lead_id, user_id, selections, call_plan, consent_call)
  values (p_lead_id, auth.uid(), p_selections, p_call_plan, true)
  returning id into v_id;

  insert into public.funnel_events (stage, lead_id, booking_id)
  values ('booking_created', p_lead_id, v_id);

  return jsonb_build_object('booking_id', v_id);
end;
$$;
revoke execute on function public.create_booking(uuid, jsonb, text, boolean) from public;
grant execute on function public.create_booking(uuid, jsonb, text, boolean) to authenticated;

-- Expert sick-toggle: the signed-in expert flips their own availability.
create or replace function public.set_expert_availability(p_available boolean)
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
  where user_id = auth.uid()
  returning id into v_id;
  if v_id is null then
    raise exception 'no expert profile for this account' using errcode = '42501';
  end if;
  return jsonb_build_object('expert_id', v_id, 'available', coalesce(p_available, true));
end;
$$;
revoke execute on function public.set_expert_availability(boolean) from public;
grant execute on function public.set_expert_availability(boolean) to authenticated;

-- ---- Internal RPCs (server-only; gated on the internal secret) ----

create or replace function public.record_payment_order(
  p_secret text, p_booking_id uuid, p_order_id text, p_amount integer, p_currency text
)
returns uuid
language plpgsql security definer
set search_path = public, extensions, private
as $$
declare
  v_id uuid;
begin
  if not public.internal_ok(p_secret) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if not exists (select 1 from public.bookings b where b.id = p_booking_id and b.status = 'pending_payment') then
    raise exception 'booking not found or not awaiting payment' using errcode = '22023';
  end if;
  insert into public.payments (booking_id, order_id, amount, currency)
  values (p_booking_id, p_order_id, p_amount, coalesce(p_currency, 'INR'))
  returning id into v_id;
  return v_id;
end;
$$;

-- The ONLY path that marks a booking paid: called by the webhook route after
-- HMAC signature verification (spec: a client-side redirect is never proof).
create or replace function public.record_payment_captured(
  p_secret text, p_order_id text, p_payment_id text, p_raw jsonb
)
returns jsonb
language plpgsql security definer
set search_path = public, extensions, private
as $$
declare
  v_booking uuid;
  v_status text;
begin
  if not public.internal_ok(p_secret) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  select booking_id, status into v_booking, v_status
  from public.payments where order_id = p_order_id;
  if v_booking is null then
    raise exception 'unknown order' using errcode = '22023';
  end if;
  if v_status = 'captured' then
    return jsonb_build_object('booking_id', v_booking, 'already_captured', true);
  end if;

  update public.payments
  set status = 'captured', payment_id = p_payment_id, raw_event = p_raw
  where order_id = p_order_id;

  update public.bookings set status = 'paid'
  where id = v_booking and status = 'pending_payment';

  insert into public.funnel_events (stage, booking_id) values ('payment_captured', v_booking);
  return jsonb_build_object('booking_id', v_booking, 'already_captured', false);
end;
$$;

-- Data-layer enforcement of "no call before payment": refuses unless paid.
create or replace function public.create_call(
  p_secret text, p_booking_id uuid, p_provider_call_id text
)
returns uuid
language plpgsql security definer
set search_path = public, extensions, private
as $$
declare
  v_id uuid;
begin
  if not public.internal_ok(p_secret) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if not exists (select 1 from public.bookings b where b.id = p_booking_id and b.status = 'paid') then
    raise exception 'call refused: booking is not in paid status' using errcode = '42501';
  end if;
  insert into public.calls (booking_id, provider_call_id)
  values (p_booking_id, p_provider_call_id)
  returning id into v_id;
  update public.bookings set status = 'call_scheduled' where id = p_booking_id;
  insert into public.funnel_events (stage, booking_id) values ('call_triggered', p_booking_id);
  return v_id;
end;
$$;

-- Transcript ingestion + routing. Low confidence => flagged for human review
-- before any reveal (spec).
create or replace function public.ingest_transcript(
  p_secret text, p_call_id uuid, p_transcript jsonb, p_routing jsonb, p_confidence numeric
)
returns jsonb
language plpgsql security definer
set search_path = public, extensions, private
as $$
declare
  v_booking uuid;
  v_needs_review boolean := coalesce(p_confidence, 0) < 0.7;
  v_expert uuid;
begin
  if not public.internal_ok(p_secret) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  select booking_id into v_booking from public.calls where id = p_call_id;
  if v_booking is null then
    raise exception 'unknown call' using errcode = '22023';
  end if;

  if not v_needs_review then
    select e.id into v_expert
    from public.experts e
    where e.available and e.categories ? (p_routing->>'category')
    order by e.created_at
    limit 1;
  end if;

  update public.calls
  set transcript = p_transcript, routing = p_routing, confidence = p_confidence,
      needs_human_review = v_needs_review, status = 'completed'
  where id = p_call_id;

  update public.bookings
  set status = 'call_complete', expert_id = coalesce(v_expert, expert_id)
  where id = v_booking;

  insert into public.funnel_events (stage, booking_id, meta)
  values ('call_completed', v_booking,
          jsonb_build_object('needs_human_review', v_needs_review));
  if v_expert is not null then
    insert into public.funnel_events (stage, booking_id, meta)
    values ('routed', v_booking, jsonb_build_object('expert_id', v_expert));
  end if;

  return jsonb_build_object(
    'booking_id', v_booking,
    'needs_human_review', v_needs_review,
    'expert_assigned', v_expert is not null
  );
end;
$$;

create or replace function public.create_outreach_campaign(p_secret text, p jsonb)
returns uuid
language plpgsql security definer
set search_path = public, extensions, private
as $$
declare
  v_id uuid;
begin
  if not public.internal_ok(p_secret) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if pg_column_size(p) > 20000 then
    raise exception 'payload too large' using errcode = '22001';
  end if;
  insert into public.outreach_campaigns (payload) values (coalesce(p, '{}'::jsonb))
  returning id into v_id;
  return v_id;
end;
$$;

-- Founder funnel view (spec: GET /api/dashboard/funnel).
create or replace function public.funnel_snapshot(p_secret text)
returns jsonb
language plpgsql stable security definer
set search_path = public, extensions, private
as $$
begin
  if not public.internal_ok(p_secret) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'leads', (select count(*) from public.leads),
    'bookings', (select count(*) from public.bookings),
    'paid', (select count(*) from public.bookings where status in ('paid','call_scheduled','call_complete')),
    'calls_triggered', (select count(*) from public.calls),
    'calls_completed', (select count(*) from public.calls where status = 'completed'),
    'flagged_for_review', (select count(*) from public.calls where needs_human_review),
    'experts_total', (select count(*) from public.experts),
    'experts_available', (select count(*) from public.experts where available),
    'events', (
      select coalesce(jsonb_object_agg(stage, n), '{}'::jsonb)
      from (select stage, count(*) n from public.funnel_events group by stage) s
    )
  );
end;
$$;

-- Internal functions carry no default grants; see 20260707000200 for the
-- anon EXECUTE grants (the secret argument is the real gate).
revoke execute on function public.record_payment_order(text, uuid, text, integer, text) from public, anon, authenticated;
revoke execute on function public.record_payment_captured(text, text, text, jsonb) from public, anon, authenticated;
revoke execute on function public.create_call(text, uuid, text) from public, anon, authenticated;
revoke execute on function public.ingest_transcript(text, uuid, jsonb, jsonb, numeric) from public, anon, authenticated;
revoke execute on function public.create_outreach_campaign(text, jsonb) from public, anon, authenticated;
revoke execute on function public.funnel_snapshot(text) from public, anon, authenticated;
