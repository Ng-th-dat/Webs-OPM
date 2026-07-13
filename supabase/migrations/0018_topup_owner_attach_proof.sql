-- WalletPage.tsx used to create the phieu_topups row only after the user clicked
-- "Submit", by which point they may have already transferred money against a code the
-- server never persisted — backwards for the auto-reconciliation flow, which needs the
-- row to exist *before* the transfer lands. The row is now created the moment a package
-- is selected (before any money moves), and a proof screenshot — still optional — can
-- only be attached afterward, which requires an update the owner previously had no
-- policy for (0014 only ever let admins update rows). Scoped to `status = 'pending'` on
-- both sides so a user can never use this to flip their own row to 'approved' or
-- reassign it to another account.
drop policy if exists "Users can attach proof to their own pending topups" on public.phieu_topups;
create policy "Users can attach proof to their own pending topups"
  on public.phieu_topups
  for update
  using (auth.uid() = user_id and status = 'pending')
  with check (auth.uid() = user_id and status = 'pending');
