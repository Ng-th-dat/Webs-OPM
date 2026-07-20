-- Schedule of new SEA server openings. The publisher announces each one individually with
-- no fixed cadence (unlike, say, a predictable weekly cutover), so this is admin-entered
-- like release_schedule/character_intel, not computed. One row per server launch; whether
-- a server reads as "upcoming"/"just opened"/"established" is derived from open_date at
-- read time (see src/utils/seaServers.ts), not stored.

create table if not exists public.sea_new_servers (
  id text primary key,
  server_label text not null,
  open_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sea_new_servers_open_date_idx on public.sea_new_servers (open_date desc);

-- Reuses the set_updated_at() trigger function created in 0001_create_characters.sql.
drop trigger if exists sea_new_servers_set_updated_at on public.sea_new_servers;
create trigger sea_new_servers_set_updated_at
  before update on public.sea_new_servers
  for each row
  execute function public.set_updated_at();

alter table public.sea_new_servers enable row level security;

drop policy if exists "Public read access" on public.sea_new_servers;
create policy "Public read access"
  on public.sea_new_servers
  for select
  using (true);

drop policy if exists "Admin write access" on public.sea_new_servers;
create policy "Admin write access"
  on public.sea_new_servers
  for all
  using (public.is_admin())
  with check (public.is_admin());
