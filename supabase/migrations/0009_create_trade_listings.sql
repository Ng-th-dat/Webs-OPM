-- Pure classifieds board for account trading — the site never touches money in any
-- form. price_text/contact_info are free text the seller writes themselves; buyer and
-- seller connect here and transact entirely off-platform at their own risk (see
-- TradeDisclaimerPage). Every listing needs admin approval before it's publicly visible.
--
-- Deliberately a real hard delete (unlike characters.is_visible's soft delete) — these
-- are user-owned, transient rows with no other table's FK into them, so users can
-- actually delete their own listing.

create table if not exists public.trade_listings (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null,
  price_text text not null,
  server text not null check (server in ('CN', 'SEA', 'Global')),
  contact_info text not null,
  images text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'sold')),
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trade_listings_status_idx on public.trade_listings (status);
create index if not exists trade_listings_user_id_idx on public.trade_listings (user_id);
create index if not exists trade_listings_created_at_idx on public.trade_listings (created_at desc);

-- Reuses the set_updated_at() trigger function created in 0001_create_characters.sql.
drop trigger if exists trade_listings_set_updated_at on public.trade_listings;
create trigger trade_listings_set_updated_at
  before update on public.trade_listings
  for each row
  execute function public.set_updated_at();

-- RLS with_check can only validate the proposed new row, not compare it against the old
-- one — so the "editing an approved listing must send it back for re-review" rule (the
-- moderation-bypass fix) has to live in a BEFORE UPDATE trigger instead of a policy.
-- Admins bypass all of this. For everyone else: the only self-service status transition
-- is a pure "approved -> sold" flip (no other column touched); any other change to a
-- previously-approved listing's content resets it to pending; and no non-admin can ever
-- set status to 'approved' directly.
create or replace function public.enforce_trade_listing_transitions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if old.status = 'approved' then
    if new.status = 'sold'
      and new.title = old.title
      and new.description = old.description
      and new.price_text = old.price_text
      and new.server = old.server
      and new.contact_info = old.contact_info
      and new.images = old.images
    then
      return new;
    end if;

    new.status := 'pending';
    new.rejection_reason := null;
    return new;
  end if;

  if new.status = 'approved' then
    raise exception 'Only an admin can approve a listing';
  end if;

  return new;
end;
$$;

drop trigger if exists trade_listings_enforce_transitions on public.trade_listings;
create trigger trade_listings_enforce_transitions
  before update on public.trade_listings
  for each row
  execute function public.enforce_trade_listing_transitions();

alter table public.trade_listings enable row level security;

drop policy if exists "Public read access to approved listings" on public.trade_listings;
create policy "Public read access to approved listings"
  on public.trade_listings
  for select
  using (status = 'approved' or auth.uid() = user_id or public.is_admin());

-- status = 'pending' here is load-bearing: without it, a direct REST insert with the
-- anon key could create a pre-approved listing, bypassing moderation entirely.
drop policy if exists "Users can create their own pending listings" on public.trade_listings;
create policy "Users can create their own pending listings"
  on public.trade_listings
  for insert
  with check (auth.uid() = user_id and status = 'pending');

drop policy if exists "Owners and admins can update listings" on public.trade_listings;
create policy "Owners and admins can update listings"
  on public.trade_listings
  for update
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "Owners and admins can delete listings" on public.trade_listings;
create policy "Owners and admins can delete listings"
  on public.trade_listings
  for delete
  using (auth.uid() = user_id or public.is_admin());
