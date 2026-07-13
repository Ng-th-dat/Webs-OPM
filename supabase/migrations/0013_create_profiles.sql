-- One row per auth user, holding their "phiếu" (platform token) balance — 1 phiếu =
-- 1,000 VND, used to pay the trade-listing posting fee (5 phiếu/listing) without a
-- fresh bank transfer on every single post. auth.users lives in a protected schema and
-- can't be altered directly, hence a public.profiles mirror row per user.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phieu_balance integer not null default 0 check (phieu_balance >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- Auto-create a profile row for every new signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Backfill for accounts created before this migration.
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

alter table public.profiles enable row level security;

-- No insert/update/delete policies at all — phieu_balance only ever changes via the
-- security-definer functions below (approve_phieu_topup) and the trade-listing fee
-- trigger, never a direct client write. This prevents a user from just PATCHing their
-- own balance up.
drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles
  for select
  using (auth.uid() = id or public.is_admin());
