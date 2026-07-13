-- Authorization table for the admin app. Deliberately keyed by the immutable auth.users
-- id (not email, which a user can change) and has zero RLS policies of its own — the
-- only ways to touch it are the SQL editor (manual, one insert per admin — see
-- CLAUDE.md/README for the bootstrap step) or the is_admin() function below, which is
-- security definer so it can read this table despite RLS blocking direct access.

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;
-- No policies: this table is fully locked down from both the anon and authenticated
-- roles. Nothing should ever read or write it over the anon key.

create or replace function public.is_admin(check_user_id uuid default auth.uid())
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = check_user_id);
$$;

grant execute on function public.is_admin(uuid) to anon, authenticated;
