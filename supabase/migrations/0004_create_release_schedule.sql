-- Monthly character release schedule (CN/SEA/Global). Each row references a character
-- by id instead of duplicating its name/image/rarity/etc — those get joined in at read
-- time (see src/lib/api/releaseSchedule.ts), so there's one source of truth per character.

create table if not exists public.release_schedule (
  id text primary key,
  month int not null check (month between 1 and 12),
  year int not null check (year >= 2020),
  server text not null check (server in ('CN', 'SEA', 'Global')),
  character_id text not null references public.characters(id) on delete cascade,
  release_type text not null check (release_type in ('Debut', 'Comeback', 'Limited', 'Core', 'Event')),
  timing text not null check (timing in ('Start of Month', 'Mid Month', 'End of Month')),
  status text not null check (status in ('Upcoming', 'Released', 'TBD')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists release_schedule_year_month_server_idx on public.release_schedule (year, month, server);
create index if not exists release_schedule_character_id_idx on public.release_schedule (character_id);

-- Reuses the set_updated_at() trigger function created in 0001_create_characters.sql.
drop trigger if exists release_schedule_set_updated_at on public.release_schedule;
create trigger release_schedule_set_updated_at
  before update on public.release_schedule
  for each row
  execute function public.set_updated_at();

alter table public.release_schedule enable row level security;

drop policy if exists "Public read access" on public.release_schedule;
create policy "Public read access"
  on public.release_schedule
  for select
  using (true);

-- TEMPORARY: no admin auth yet, mirrors the open write policy on public.characters.
drop policy if exists "Temporary open write access" on public.release_schedule;
create policy "Temporary open write access"
  on public.release_schedule
  for all
  using (true)
  with check (true);
