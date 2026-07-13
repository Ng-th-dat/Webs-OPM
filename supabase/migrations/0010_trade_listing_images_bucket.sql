-- Public storage bucket for trade-listing screenshots, uploaded by the listing's own
-- owner. Path convention: <user_id>/<listing_id>/<file>. Public read like every other
-- bucket in this project — the images aren't secret; the actually-sensitive field
-- (contact_info) lives in the RLS-protected trade_listings table, not here.

insert into storage.buckets (id, name, public)
values ('trade-listing-images', 'trade-listing-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read access for trade listing images" on storage.objects;
create policy "Public read access for trade listing images"
  on storage.objects
  for select
  using (bucket_id = 'trade-listing-images');

drop policy if exists "Owners and admins can write trade listing images" on storage.objects;
create policy "Owners and admins can write trade listing images"
  on storage.objects
  for all
  using (
    bucket_id = 'trade-listing-images'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  )
  with check (
    bucket_id = 'trade-listing-images'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );
