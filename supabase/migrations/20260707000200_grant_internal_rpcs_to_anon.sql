-- Internal RPCs are invoked by the app server over PostgREST using the anon
-- key; their real gate is the internal-secret check inside each function
-- (public.internal_ok). Grant EXECUTE so the calls reach that gate.
grant execute on function public.record_payment_order(text, uuid, text, integer, text) to anon, authenticated;
grant execute on function public.record_payment_captured(text, text, text, jsonb) to anon, authenticated;
grant execute on function public.create_call(text, uuid, text) to anon, authenticated;
grant execute on function public.ingest_transcript(text, uuid, jsonb, jsonb, numeric) to anon, authenticated;
grant execute on function public.create_outreach_campaign(text, jsonb) to anon, authenticated;
grant execute on function public.funnel_snapshot(text) to anon, authenticated;
