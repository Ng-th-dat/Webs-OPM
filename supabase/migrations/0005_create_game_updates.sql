-- Game Updates feed (patch notes / events / CN news / maintenance notices), migrated off
-- the local src/data/gameUpdates.ts mock. `server` tags which server (CN/SEA/Global) an
-- entry applies to — nullable since some posts (e.g. general patch notes) aren't server-specific.
-- `events` mirrors the UpdateSubEvent[] shape from src/types/gameUpdate.ts as JSONB.

create table if not exists public.game_updates (
  id text primary key,
  slug text not null unique,
  category text not null check (category in ('Update', 'Event', 'CnNews', 'Maintenance')),
  server text check (server in ('CN', 'SEA', 'Global')),
  date date not null,
  title text not null,
  description text not null,
  image text,
  events jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists game_updates_date_idx on public.game_updates (date desc);

-- Reuses the set_updated_at() trigger function created in 0001_create_characters.sql.
drop trigger if exists game_updates_set_updated_at on public.game_updates;
create trigger game_updates_set_updated_at
  before update on public.game_updates
  for each row
  execute function public.set_updated_at();

alter table public.game_updates enable row level security;

drop policy if exists "Public read access" on public.game_updates;
create policy "Public read access"
  on public.game_updates
  for select
  using (true);

-- TEMPORARY: no admin auth yet, mirrors the open write policy on public.characters.
drop policy if exists "Temporary open write access" on public.game_updates;
create policy "Temporary open write access"
  on public.game_updates
  for all
  using (true)
  with check (true);
