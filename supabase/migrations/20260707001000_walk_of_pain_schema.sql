-- ============================================================================
-- The Walk (voice-first intake) — replaces the rule-based diagnostic.
-- Part 1: fixed voice questions. Part 2: LLM-generated "right questions"
-- (voice). Part 3: typed facts for research. Then membership, live report
-- generation, and AI screening scheduling.
-- Same access model as the rest: deny-all RLS, SECURITY DEFINER RPCs,
-- internal RPCs gated on the hashed secret in private.config.
-- Applied to project kxbcltelawavlynrdrsm on 2026-07-07 via MCP.
-- ============================================================================

create table public.walks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'in_progress'
    check (status in ('in_progress','submitted','report_generating','report_ready')),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  duration_seconds integer,
  user_id uuid references auth.users (id) on delete set null,
  contact jsonb not null default '{}'::jsonb,
  questions_generated boolean not null default false,
  report jsonb,
  report_started_at timestamptz,
  report_ready_at timestamptz
);

create table public.walk_answers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  walk_id uuid not null references public.walks (id) on delete cascade,
  section text not null check (section in ('one','two')),
  question_index integer not null check (question_index between 0 and 19),
  question text not null,
  transcript text not null,
  edited_transcript text,
  audio_path text,
  unique (walk_id, section, question_index)
);

create table public.walk_questions (
  id uuid primary key default gen_random_uuid(),
  walk_id uuid not null references public.walks (id) on delete cascade,
  question_index integer not null check (question_index between 0 and 19),
  question text not null,
  unique (walk_id, question_index)
);

create table public.screenings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users (id) on delete cascade,
  walk_id uuid references public.walks (id) on delete set null,
  phone text not null,
  scheduled_at timestamptz not null,
  status text not null default 'scheduled'
    check (status in ('scheduled','triggered','completed','cancelled')),
  provider_call_id text
);

alter table public.walks enable row level security;
alter table public.walk_answers enable row level security;
alter table public.walk_questions enable row level security;
alter table public.screenings enable row level security;
revoke all on public.walks, public.walk_answers, public.walk_questions, public.screenings
  from anon, authenticated;

-- Private bucket for the raw voice recordings (uploaded server-side).
insert into storage.buckets (id, name, public)
values ('walk-audio', 'walk-audio', false)
on conflict (id) do nothing;

-- ---- Anonymous RPCs (walk uuid = capability token, same as leads) ----

create or replace function public.create_walk()
returns uuid
language plpgsql security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into public.walks default values returning id into v_id;
  insert into public.funnel_events (stage, meta)
  values ('walk_started', jsonb_build_object('walk_id', v_id));
  return v_id;
end;
$$;
revoke execute on function public.create_walk() from public;
grant execute on function public.create_walk() to anon, authenticated;

create or replace function public.save_walk_answer(
  p_walk_id uuid, p_section text, p_index integer,
  p_question text, p_transcript text, p_audio_path text
)
returns uuid
language plpgsql security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_section not in ('one','two') or p_index < 0 or p_index > 19 then
    raise exception 'invalid section or index' using errcode = '22023';
  end if;
  if length(coalesce(p_question,'')) < 1 or length(p_question) > 1000
     or length(coalesce(p_transcript,'')) < 1 or length(p_transcript) > 20000 then
    raise exception 'question/transcript missing or too long' using errcode = '22023';
  end if;
  if not exists (select 1 from public.walks w where w.id = p_walk_id and w.status = 'in_progress') then
    raise exception 'walk not found or already submitted' using errcode = '22023';
  end if;

  insert into public.walk_answers (walk_id, section, question_index, question, transcript, audio_path)
  values (p_walk_id, p_section, p_index, p_question, p_transcript, p_audio_path)
  on conflict (walk_id, section, question_index)
  do update set question = excluded.question, transcript = excluded.transcript,
                audio_path = coalesce(excluded.audio_path, public.walk_answers.audio_path),
                edited_transcript = null, created_at = now()
  returning id into v_id;
  return v_id;
end;
$$;
revoke execute on function public.save_walk_answer(uuid, text, integer, text, text, text) from public;
grant execute on function public.save_walk_answer(uuid, text, integer, text, text, text) to anon, authenticated;

-- Resume/progress read. The walk uuid is the capability; returns the walker's
-- own material only (never the report — that is members-only via my_walks).
create or replace function public.get_walk(p_walk_id uuid)
returns jsonb
language sql stable security definer
set search_path = public
as $$
  select jsonb_build_object(
    'walk_id', w.id,
    'status', w.status,
    'started_at', w.started_at,
    'questions_generated', w.questions_generated,
    'answers', coalesce((
      select jsonb_agg(jsonb_build_object(
        'section', a.section, 'index', a.question_index,
        'question', a.question, 'transcript', coalesce(a.edited_transcript, a.transcript)
      ) order by a.section, a.question_index)
      from public.walk_answers a where a.walk_id = w.id
    ), '[]'::jsonb),
    'questions', coalesce((
      select jsonb_agg(q.question order by q.question_index)
      from public.walk_questions q where q.walk_id = w.id
    ), '[]'::jsonb)
  )
  from public.walks w
  where w.id = p_walk_id;
$$;
revoke execute on function public.get_walk(uuid) from public;
grant execute on function public.get_walk(uuid) to anon, authenticated;

create or replace function public.submit_walk(p_walk_id uuid, p_contact jsonb)
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  v_name text := left(trim(coalesce(p_contact->>'name','')), 200);
  v_email text := left(trim(coalesce(p_contact->>'email','')), 320);
  v_duration integer;
  v_avg integer;
  v_count integer;
begin
  if pg_column_size(p_contact) > 12000 then
    raise exception 'payload too large' using errcode = '22001';
  end if;
  if v_name = '' or v_email = '' or position('@' in v_email) < 2 then
    raise exception 'name and a valid email are required' using errcode = '22023';
  end if;
  if not exists (select 1 from public.walks w where w.id = p_walk_id and w.status = 'in_progress') then
    raise exception 'walk not found or already submitted' using errcode = '22023';
  end if;
  if not exists (select 1 from public.walk_answers a where a.walk_id = p_walk_id) then
    raise exception 'no answers recorded yet' using errcode = '22023';
  end if;

  update public.walks
  set status = 'submitted',
      submitted_at = now(),
      duration_seconds = greatest(1, extract(epoch from (now() - started_at))::integer),
      contact = p_contact
  where id = p_walk_id
  returning duration_seconds into v_duration;

  select count(*), avg(duration_seconds)::integer into v_count, v_avg
  from public.walks where duration_seconds is not null;

  insert into public.funnel_events (stage, meta)
  values ('walk_submitted', jsonb_build_object('walk_id', p_walk_id, 'duration_seconds', v_duration));

  return jsonb_build_object(
    'walk_id', p_walk_id,
    'duration_seconds', v_duration,
    'average_duration_seconds', case when v_count >= 10 then v_avg else null end,
    'walk_count', v_count
  );
end;
$$;
revoke execute on function public.submit_walk(uuid, jsonb) from public;
grant execute on function public.submit_walk(uuid, jsonb) to anon, authenticated;

-- ---- Authenticated RPCs (members) ----

create or replace function public.claim_walk(p_walk_id uuid)
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  v_owner uuid;
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  select user_id into v_owner from public.walks where id = p_walk_id;
  if v_owner is not null and v_owner <> auth.uid() then
    raise exception 'this walk belongs to another member' using errcode = '42501';
  end if;
  update public.walks set user_id = auth.uid() where id = p_walk_id and user_id is null;
  if v_owner is null then
    insert into public.funnel_events (stage, meta)
    values ('walk_claimed', jsonb_build_object('walk_id', p_walk_id));
  end if;
  return jsonb_build_object('walk_id', p_walk_id, 'claimed', true);
end;
$$;
revoke execute on function public.claim_walk(uuid) from public;
grant execute on function public.claim_walk(uuid) to authenticated;

create or replace function public.my_walks()
returns jsonb
language sql stable security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'walk_id', w.id,
    'status', w.status,
    'started_at', w.started_at,
    'submitted_at', w.submitted_at,
    'duration_seconds', w.duration_seconds,
    'contact', w.contact,
    'report', w.report,
    'report_started_at', w.report_started_at,
    'report_ready_at', w.report_ready_at,
    'answers', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', a.id, 'section', a.section, 'index', a.question_index,
        'question', a.question,
        'transcript', a.transcript,
        'edited_transcript', a.edited_transcript
      ) order by a.section, a.question_index)
      from public.walk_answers a where a.walk_id = w.id
    ), '[]'::jsonb)
  ) order by w.created_at desc), '[]'::jsonb)
  from public.walks w
  where w.user_id = auth.uid();
$$;
revoke execute on function public.my_walks() from public;
grant execute on function public.my_walks() to authenticated;

create or replace function public.edit_walk_answer(p_answer_id uuid, p_text text)
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  v_ok integer;
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if length(coalesce(p_text,'')) < 1 or length(p_text) > 20000 then
    raise exception 'text missing or too long' using errcode = '22023';
  end if;
  update public.walk_answers a
  set edited_transcript = p_text
  from public.walks w
  where a.id = p_answer_id and w.id = a.walk_id and w.user_id = auth.uid();
  get diagnostics v_ok = row_count;
  if v_ok = 0 then
    raise exception 'answer not found or not yours' using errcode = '42501';
  end if;
  return jsonb_build_object('answer_id', p_answer_id, 'saved', true);
end;
$$;
revoke execute on function public.edit_walk_answer(uuid, text) from public;
grant execute on function public.edit_walk_answer(uuid, text) to authenticated;

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
revoke execute on function public.schedule_screening(uuid, text, timestamptz) from public;
grant execute on function public.schedule_screening(uuid, text, timestamptz) to authenticated;

create or replace function public.my_screenings()
returns jsonb
language sql stable security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'screening_id', s.id, 'walk_id', s.walk_id, 'scheduled_at', s.scheduled_at,
    'status', s.status, 'created_at', s.created_at
  ) order by s.created_at desc), '[]'::jsonb)
  from public.screenings s
  where s.user_id = auth.uid();
$$;
revoke execute on function public.my_screenings() from public;
grant execute on function public.my_screenings() to authenticated;

-- ---- Internal RPCs (server-only, secret-gated) ----

create or replace function public.set_walk_questions(p_secret text, p_walk_id uuid, p_questions jsonb)
returns jsonb
language plpgsql security definer
set search_path = public, extensions, private
as $$
declare
  v_q text;
  v_i integer := 0;
  v_existing jsonb;
begin
  if not public.internal_ok(p_secret) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  select coalesce(jsonb_agg(question order by question_index), '[]'::jsonb)
  into v_existing from public.walk_questions where walk_id = p_walk_id;
  if jsonb_array_length(v_existing) > 0 then
    return jsonb_build_object('questions', v_existing, 'already_generated', true);
  end if;
  if jsonb_typeof(p_questions) is distinct from 'array'
     or jsonb_array_length(p_questions) < 1 or jsonb_array_length(p_questions) > 12 then
    raise exception 'questions must be a list of 1-12' using errcode = '22023';
  end if;
  for v_q in select jsonb_array_elements_text(p_questions) loop
    insert into public.walk_questions (walk_id, question_index, question)
    values (p_walk_id, v_i, left(v_q, 1000));
    v_i := v_i + 1;
  end loop;
  update public.walks set questions_generated = true where id = p_walk_id;
  return jsonb_build_object('questions', p_questions, 'already_generated', false);
end;
$$;

-- Marks generation started and returns everything the LLM needs, atomically
-- (single-shot: only one caller can flip submitted -> report_generating).
create or replace function public.start_walk_report(p_secret text, p_walk_id uuid)
returns jsonb
language plpgsql security definer
set search_path = public, extensions, private
as $$
declare
  v_updated integer;
begin
  if not public.internal_ok(p_secret) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  update public.walks set status = 'report_generating', report_started_at = now()
  where id = p_walk_id and status = 'submitted';
  get diagnostics v_updated = row_count;
  if v_updated = 0 then
    raise exception 'walk is not awaiting a report' using errcode = '22023';
  end if;
  return (select jsonb_build_object(
    'walk_id', w.id,
    'contact', w.contact,
    'answers', coalesce((
      select jsonb_agg(jsonb_build_object(
        'section', a.section, 'question', a.question,
        'transcript', coalesce(a.edited_transcript, a.transcript)
      ) order by a.section, a.question_index)
      from public.walk_answers a where a.walk_id = w.id
    ), '[]'::jsonb)
  ) from public.walks w where w.id = p_walk_id);
end;
$$;

create or replace function public.finish_walk_report(p_secret text, p_walk_id uuid, p_report jsonb)
returns void
language plpgsql security definer
set search_path = public, extensions, private
as $$
begin
  if not public.internal_ok(p_secret) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  update public.walks
  set report = p_report, status = 'report_ready', report_ready_at = now()
  where id = p_walk_id and status = 'report_generating';
  insert into public.funnel_events (stage, meta)
  values ('walk_report_ready', jsonb_build_object('walk_id', p_walk_id));
end;
$$;

create or replace function public.fail_walk_report(p_secret text, p_walk_id uuid)
returns void
language plpgsql security definer
set search_path = public, extensions, private
as $$
begin
  if not public.internal_ok(p_secret) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  update public.walks set status = 'submitted', report_started_at = null
  where id = p_walk_id and status = 'report_generating';
end;
$$;

create or replace function public.mark_screening_triggered(p_secret text, p_screening_id uuid, p_provider_call_id text)
returns void
language plpgsql security definer
set search_path = public, extensions, private
as $$
begin
  if not public.internal_ok(p_secret) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  update public.screenings set status = 'triggered', provider_call_id = p_provider_call_id
  where id = p_screening_id and status = 'scheduled';
end;
$$;

-- Report status by capability uuid: timing + status only, NEVER the report
-- body (that is members-only via my_walks).
create or replace function public.walk_report_status(p_walk_id uuid)
returns jsonb
language sql stable security definer
set search_path = public
as $$
  select jsonb_build_object(
    'walk_id', w.id,
    'status', w.status,
    'report_started_at', w.report_started_at,
    'report_ready_at', w.report_ready_at,
    'average_generation_seconds', (
      select case when count(*) >= 10
        then avg(extract(epoch from (report_ready_at - report_started_at)))::integer
        else null end
      from public.walks
      where report_ready_at is not null and report_started_at is not null
    )
  )
  from public.walks w where w.id = p_walk_id;
$$;
revoke execute on function public.walk_report_status(uuid) from public;
grant execute on function public.walk_report_status(uuid) to anon, authenticated;

-- Internal RPCs reach their in-function secret gate via the anon role.
grant execute on function public.set_walk_questions(text, uuid, jsonb) to anon, authenticated;
grant execute on function public.start_walk_report(text, uuid) to anon, authenticated;
grant execute on function public.finish_walk_report(text, uuid, jsonb) to anon, authenticated;
grant execute on function public.fail_walk_report(text, uuid) to anon, authenticated;
grant execute on function public.mark_screening_triggered(text, uuid, text) to anon, authenticated;
