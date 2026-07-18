-- Pre-release "Intel" dossiers: hints/rumors CN NPH drops about an upcoming character before
-- its skill kit is confirmed and it's added to public.characters. One row per rumored character,
-- accumulating `hints` (a JSONB timeline, each entry tagged with its own confidence level) as more
-- leaks land — mirrors the events-as-JSONB pattern from 0005_create_game_updates.sql.
-- Guess fields stay nullable/free-ish since nothing is confirmed until the dossier's status flips.

create table if not exists public.character_intel (
  id text primary key,
  slug text not null unique,
  status text not null default 'rumored' check (status in ('rumored', 'confirmed')),
  character_name text not null,
  rarity_guess text check (rarity_guess in ('UR+', 'UR', 'SSR+', 'SSR', 'SR', 'R', 'N')),
  type_guess text,
  faction_guess text,
  role_guess text,
  summary text,
  cover_image text,
  hints jsonb not null default '[]'::jsonb,
  -- Optional manual link to the real characters.slug once it ships — no auto-promotion pipeline,
  -- the admin just creates the real character normally and points this back at it.
  confirmed_character_slug text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists character_intel_status_idx on public.character_intel (status);
create index if not exists character_intel_updated_at_idx on public.character_intel (updated_at desc);

drop trigger if exists character_intel_set_updated_at on public.character_intel;
create trigger character_intel_set_updated_at
  before update on public.character_intel
  for each row
  execute function public.set_updated_at();

alter table public.character_intel enable row level security;

drop policy if exists "Public read access" on public.character_intel;
create policy "Public read access"
  on public.character_intel
  for select
  using (true);

drop policy if exists "Admin write access" on public.character_intel;
create policy "Admin write access"
  on public.character_intel
  for all
  using (public.is_admin())
  with check (public.is_admin());
