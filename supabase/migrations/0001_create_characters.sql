-- Characters table for S-Class Codex.
-- Nested character sub-structures (skills, passive, awakenings, core) are stored as
-- JSONB, mirroring the Skill/Passive/AwakeningTier/CoreTier shapes in src/types/character.ts,
-- so no joins are needed to render a character.

create table if not exists public.characters (
  id text primary key,
  name text not null,
  slug text not null unique,
  image text not null,
  rarity text not null check (rarity in ('UR+', 'UR', 'SSR+', 'SSR', 'SR', 'R', 'N')),
  type text not null,
  faction text not null check (faction in ('Hero', 'Monster', 'Third-party')),
  rank text not null check (rank in ('S-1', 'S-2', 'A', 'Demon', 'Dragon')),
  role text not null,
  tags text[] not null default '{}',
  skills jsonb not null default '[]',
  passive jsonb not null,
  awakenings jsonb,
  core jsonb,
  strengths text[] not null default '{}',
  weaknesses text[] not null default '{}',
  recommended_usage text not null default '',
  release_version text not null,
  release_status text not null check (release_status in ('Upcoming', 'Released', 'TBD')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists characters_slug_idx on public.characters (slug);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists characters_set_updated_at on public.characters;
create trigger characters_set_updated_at
  before update on public.characters
  for each row
  execute function public.set_updated_at();

alter table public.characters enable row level security;

-- Public site reads characters without auth.
drop policy if exists "Public read access" on public.characters;
create policy "Public read access"
  on public.characters
  for select
  using (true);

-- TEMPORARY: no admin auth wired up yet, so writes are open to anyone holding the anon key.
-- Tighten this (e.g. `using (auth.role() = 'authenticated')`) once the admin app has login.
drop policy if exists "Temporary open write access" on public.characters;
create policy "Temporary open write access"
  on public.characters
  for all
  using (true)
  with check (true);
