-- Public storage bucket for Ticket Calculator source icons uploaded from the admin app.
-- Mirrors 0022_mastery_material_images_bucket.sql.

insert into storage.buckets (id, name, public)
values ('ticket-source-images', 'ticket-source-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read access for ticket source images" on storage.objects;
create policy "Public read access for ticket source images"
  on storage.objects
  for select
  using (bucket_id = 'ticket-source-images');

drop policy if exists "Admin write access for ticket source images" on storage.objects;
create policy "Admin write access for ticket source images"
  on storage.objects
  for all
  using (bucket_id = 'ticket-source-images' and public.is_admin())
  with check (bucket_id = 'ticket-source-images' and public.is_admin());
