-- Adds SePay webhook auto-reconciliation as the primary path for phiếu top-ups,
-- alongside the existing admin manual approve/reject (0014) as a fallback for
-- transfers the webhook can't auto-match (wrong content/amount). The transfer note
-- shown in the wallet UI (`NAPPHIEU <code>`) is now persisted as `transfer_code` so
-- the webhook has something to match against — previously it only existed client-side
-- for display. `payment_proof_url` becomes optional: no longer a submission gate, just
-- evidence a user can attach if a transfer needs manual follow-up.

alter table public.phieu_topups
  add column if not exists transfer_code text,
  add column if not exists sepay_transaction_id text,
  add column if not exists auto_matched boolean not null default false;

alter table public.phieu_topups
  alter column payment_proof_url drop not null;

-- Table is still empty in production at the time of this migration, so `not null` can
-- be added directly with no backfill.
alter table public.phieu_topups
  alter column transfer_code set not null;

-- Idempotency backstop: a real SePay transaction id can only ever be recorded once,
-- so a retried/duplicate webhook delivery for the same transaction can't double-credit
-- even if it somehow raced past the `for update` lock in auto_approve_phieu_topup().
create unique index if not exists phieu_topups_sepay_transaction_id_idx
  on public.phieu_topups (sepay_transaction_id)
  where sepay_transaction_id is not null;

-- The webhook's hot lookup path: find the pending row for a given transfer code.
create index if not exists phieu_topups_transfer_code_idx
  on public.phieu_topups (transfer_code)
  where status = 'pending';

-- Called by supabase/functions/sepay-webhook/index.ts using the service-role key, one
-- call per incoming bank transaction on the linked MBBank account. Unlike
-- approve_phieu_topup() (0014), there is no public.is_admin() check here — the grant
-- below to `service_role` only is what keeps this from being callable by a regular
-- user or anon session; the Edge Function is the only caller, and it bypasses RLS
-- entirely via the service-role key rather than needing an authenticated-user grant.
create or replace function public.auto_approve_phieu_topup(
  p_sepay_transaction_id text,
  p_transfer_code text,
  p_amount_vnd integer
)
returns table(matched boolean, topup_id text, reason text)
language plpgsql
security definer
set search_path = public
as $$
declare
  target_id text;
  target_user_id uuid;
  target_amount_vnd integer;
  credit_amount integer;
begin
  -- Fast idempotency path: this exact SePay transaction was already processed by an
  -- earlier delivery of the same webhook event (SePay retries on non-2xx, and can
  -- redeliver even after a 2xx in rare cases).
  select id into target_id
    from public.phieu_topups
    where sepay_transaction_id = p_sepay_transaction_id;

  if target_id is not null then
    return query select false, target_id, 'already_processed';
    return;
  end if;

  -- Locks the candidate row for the duration of this transaction. If two deliveries
  -- for the same transfer_code somehow race, Postgres re-evaluates this WHERE clause
  -- against the latest committed row version once the lock is released (EvalPlanQual),
  -- so the second caller simply finds no pending row once the first has committed —
  -- the balance can only be credited once per topup row.
  select id, user_id, phieu_amount, amount_vnd
    into target_id, target_user_id, credit_amount, target_amount_vnd
    from public.phieu_topups
    where transfer_code = p_transfer_code and status = 'pending'
    order by created_at asc
    limit 1
    for update;

  if target_id is null then
    return query select false, null::text, 'no_pending_match';
    return;
  end if;

  if target_amount_vnd <> p_amount_vnd then
    -- Leave the row pending — an admin resolves this manually via the existing
    -- approve/reject flow. Do not consume the sepay_transaction_id here, since this
    -- transfer was never actually credited.
    return query select false, target_id, 'amount_mismatch';
    return;
  end if;

  update public.phieu_topups
    set status = 'approved',
        auto_matched = true,
        sepay_transaction_id = p_sepay_transaction_id,
        rejection_reason = null
    where id = target_id;

  update public.profiles
    set phieu_balance = phieu_balance + credit_amount
    where id = target_user_id;

  return query select true, target_id, 'matched';
end;
$$;

revoke all on function public.auto_approve_phieu_topup(text, text, integer) from public, anon, authenticated;
grant execute on function public.auto_approve_phieu_topup(text, text, integer) to service_role;
