-- Storage for phiếu top-up transfer screenshots. Same per-user-folder pattern as
-- trade-listing-images: path <user_id>/<topup_id>.<ext>, public read (the screenshot
-- itself isn't sensitive), write restricted to the owner or an admin.

insert into storage.buckets (id, name, public)
values ('wallet-topup-proofs', 'wallet-topup-proofs', true)
on conflict (id) do nothing;

drop policy if exists "Public read access for topup proofs" on storage.objects;
create policy "Public read access for topup proofs"
  on storage.objects
  for select
  using (bucket_id = 'wallet-topup-proofs');

drop policy if exists "Owners and admins can write topup proofs" on storage.objects;
create policy "Owners and admins can write topup proofs"
  on storage.objects
  for all
  using (
    bucket_id = 'wallet-topup-proofs'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  )
  with check (
    bucket_id = 'wallet-topup-proofs'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );
