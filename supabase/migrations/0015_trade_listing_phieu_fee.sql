-- Replaces the per-listing "upload a transfer screenshot every time" fee (0011) with a
-- phiếu balance deduction — pay once via a topup (0014), then post listings without a
-- fresh bank transfer each time. trade_listings.payment_proof_url is no longer needed:
-- the table is still empty in production, so this is a clean drop, not a deprecation.

alter table public.trade_listings
  drop column if exists payment_proof_url;

-- Deducts the posting fee atomically at insert time, so a client can't check the
-- balance and insert in two separate round trips (a TOCTOU race). `for update` locks
-- the profile row for the duration of the transaction so two concurrent listing
-- submissions from the same user can't both read the same starting balance.
create or replace function public.enforce_trade_listing_fee()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_balance integer;
  fee_amount constant integer := 5;
begin
  if public.is_admin() then
    return new;
  end if;

  select phieu_balance into current_balance
    from public.profiles
    where id = new.user_id
    for update;

  if current_balance is null or current_balance < fee_amount then
    raise exception 'Insufficient phieu balance to post a listing';
  end if;

  update public.profiles
    set phieu_balance = phieu_balance - fee_amount
    where id = new.user_id;

  return new;
end;
$$;

drop trigger if exists trade_listings_enforce_fee on public.trade_listings;
create trigger trade_listings_enforce_fee
  before insert on public.trade_listings
  for each row
  execute function public.enforce_trade_listing_fee();
