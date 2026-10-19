-- Drag Race Simulator — server-side protection for public community tables
-- Run in the Supabase SQL editor. The game now validates rows on the client, but the
-- publishable key is public, so the database must refuse invalid rows on its own.
-- NOT VALID = existing rows are not checked (nothing breaks); new rows are.

alter table public.community_queens
  add constraint cq_name_len      check (char_length(btrim(name)) between 1 and 40) not valid,
  add constraint cq_location_len  check (location is null or char_length(location) <= 60) not valid,
  add constraint cq_attr_range    check (
        cunt     between 1 and 10 and lip_sync between 1 and 10 and makeup between 1 and 10
    and sewing   between 1 and 10 and runway   between 1 and 10 and acting between 1 and 10) not valid,
  add constraint cq_attr_total    check (cunt + lip_sync + makeup + sewing + runway + acting <= 45) not valid;

-- Row Level Security: anyone may read and insert, nobody may edit or delete via the public key.
alter table public.community_queens enable row level security;

drop policy if exists "community_queens_read"   on public.community_queens;
drop policy if exists "community_queens_insert" on public.community_queens;

create policy "community_queens_read"   on public.community_queens for select to anon using (true);
create policy "community_queens_insert" on public.community_queens for insert to anon with check (true);
-- No update/delete policies => anon cannot change or wipe other players' queens.

-- Optional, stricter: block anonymous rows that claim winner = true. The game only
-- sends winner rows for opted-in player queens, but the flag itself is client-reported.
-- If you enable this, winners must be written by a server function instead.
-- drop policy "community_queens_insert" on public.community_queens;
-- create policy "community_queens_insert" on public.community_queens
--   for insert to anon with check (coalesce(winner, false) = false);

-- winner_queens is read-only for the public.
alter table public.winner_queens enable row level security;
drop policy if exists "winner_queens_read" on public.winner_queens;
create policy "winner_queens_read" on public.winner_queens for select to anon using (true);
