-- Lets a user cancel their own still-pending top-up request. phieu_topups rows are a
-- transient, user-owned draft (nothing else FKs into a pending one) until they're
-- resolved by the SePay webhook or an admin, so — same reasoning as trade_listings —
-- a real hard delete is simpler than adding a 'cancelled' status value that every
-- status-driven UI/type union downstream would then need to account for.
drop policy if exists "Users can cancel their own pending topups" on public.phieu_topups;
create policy "Users can cancel their own pending topups"
  on public.phieu_topups
  for delete
  using (auth.uid() = user_id and status = 'pending');
