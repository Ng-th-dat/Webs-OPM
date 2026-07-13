-- Top-up requests: a user pays a fixed VND amount by bank transfer (same account as
-- the donate widget / old per-listing fee), uploads a proof screenshot, and an admin
-- approves it — which is the only way phieu_balance ever goes up. Rejecting a topup
-- does not touch the balance; approving is done through approve_phieu_topup() below so
-- the status change and the balance credit happen in one atomic transaction.

create table if not exists public.phieu_topups (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  phieu_amount integer not null check (phieu_amount > 0),
  amount_vnd integer not null check (amount_vnd > 0),
  payment_proof_url text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists phieu_topups_status_idx on public.phieu_topups (status);
create index if not exists phieu_topups_user_id_idx on public.phieu_topups (user_id);

drop trigger if exists phieu_topups_set_updated_at on public.phieu_topups;
create trigger phieu_topups_set_updated_at
  before update on public.phieu_topups
  for each row
  execute function public.set_updated_at();

alter table public.phieu_topups enable row level security;

drop policy if exists "Users can read their own topups" on public.phieu_topups;
create policy "Users can read their own topups"
  on public.phieu_topups
  for select
  using (auth.uid() = user_id or public.is_admin());

-- status = 'pending' is load-bearing, same reason as trade_listings: without it, a
-- direct API call could insert a pre-approved topup and self-credit phieu.
drop policy if exists "Users can create their own pending topups" on public.phieu_topups;
create policy "Users can create their own pending topups"
  on public.phieu_topups
  for insert
  with check (auth.uid() = user_id and status = 'pending');

-- Only admins can update a topup (reject with a reason, or via the function below for
-- approval) — unlike trade_listings, the poster has no self-service edit here.
drop policy if exists "Admins can update topups" on public.phieu_topups;
create policy "Admins can update topups"
  on public.phieu_topups
  for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete topups" on public.phieu_topups;
create policy "Admins can delete topups"
  on public.phieu_topups
  for delete
  using (public.is_admin());

create or replace function public.approve_phieu_topup(topup_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_user_id uuid;
  credit_amount integer;
  current_status text;
begin
  if not public.is_admin() then
    raise exception 'Only an admin can approve a topup';
  end if;

  select user_id, phieu_amount, status
    into target_user_id, credit_amount, current_status
    from public.phieu_topups
    where id = topup_id
    for update;

  if target_user_id is null then
    raise exception 'Topup not found';
  end if;

  if current_status <> 'pending' then
    raise exception 'Topup is not pending';
  end if;

  update public.phieu_topups
    set status = 'approved', rejection_reason = null
    where id = topup_id;

  update public.profiles
    set phieu_balance = phieu_balance + credit_amount
    where id = target_user_id;
end;
$$;

grant execute on function public.approve_phieu_topup(text) to authenticated;
