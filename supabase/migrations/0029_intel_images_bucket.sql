-- Public storage bucket for Intel dossier images (cover + per-hint leak images).
-- Mirrors 0006_update_images_bucket.sql.

insert into storage.buckets (id, name, public)
values ('intel-images', 'intel-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read access for intel images" on storage.objects;
create policy "Public read access for intel images"
  on storage.objects
  for select
  using (bucket_id = 'intel-images');

drop policy if exists "Admin write access for intel images" on storage.objects;
create policy "Admin write access for intel images"
  on storage.objects
  for all
  using (bucket_id = 'intel-images' and public.is_admin())
  with check (bucket_id = 'intel-images' and public.is_admin());
