-- ============================================================================
-- Walk wireframes storage (2026-08-06): the report pipeline can attach 2+
-- illustrative UI screens (Google Stitch) showing what the recommended
-- solution could look like. Reuses the walk-audio storage CONVENTION (a
-- storage.buckets row + server-side service-role upload, see storeWalkAudio
-- in src/lib/supabase.ts) — no new storage mechanism is invented.
--
-- Unlike walk-audio (the member's private voice), these are generated,
-- non-sensitive illustrative mockups that must render inline in the
-- client-facing report, so this bucket is PUBLIC — stable <img> URLs, no
-- signed-URL expiry to manage. (Product-shape decision; flip to private +
-- signed URLs if wireframes ever carry anything sensitive.)
-- Applied to project kxbcltelawavlynrdrsm on 2026-08-06 via MCP.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('walk-wireframes', 'walk-wireframes', true)
on conflict (id) do nothing;
