-- Active redeem codes for the SEA server. One row per code; status is admin-set manually
-- (not derived from expires_at) since the publisher often kills a code early with no
-- announced date. The public site only ever queries status = 'active' (see
-- src/lib/api/gameCodes.ts) — same "public sees a subset, admin sees everything" pattern
-- as characters.is_visible, enforced client-query-side rather than via RLS.

create table if not exists public.game_codes (
  id text primary key,
  code text not null,
  reward text not null,
  expires_at date,
  status text not null default 'active' check (status in ('active', 'expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists game_codes_created_at_idx on public.game_codes (created_at desc);

-- Reuses the set_updated_at() trigger function created in 0001_create_characters.sql.
drop trigger if exists game_codes_set_updated_at on public.game_codes;
create trigger game_codes_set_updated_at
  before update on public.game_codes
  for each row
  execute function public.set_updated_at();

alter table public.game_codes enable row level security;

drop policy if exists "Public read access" on public.game_codes;
create policy "Public read access"
  on public.game_codes
  for select
  using (true);

drop policy if exists "Admin write access" on public.game_codes;
create policy "Admin write access"
  on public.game_codes
  for all
  using (public.is_admin())
  with check (public.is_admin());
