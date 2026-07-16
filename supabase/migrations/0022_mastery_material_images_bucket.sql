-- Public storage bucket for Mastery material icons uploaded from the admin app.
-- Written directly with is_admin() gating (unlike the early character-images/update-images
-- buckets, which started open and were tightened later in 0008) since public.is_admin()
-- already exists by this point.

insert into storage.buckets (id, name, public)
values ('mastery-material-images', 'mastery-material-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read access for mastery material images" on storage.objects;
create policy "Public read access for mastery material images"
  on storage.objects
  for select
  using (bucket_id = 'mastery-material-images');

drop policy if exists "Admin write access for mastery material images" on storage.objects;
create policy "Admin write access for mastery material images"
  on storage.objects
  for all
  using (bucket_id = 'mastery-material-images' and public.is_admin())
  with check (bucket_id = 'mastery-material-images' and public.is_admin());
