-- Public storage bucket for game-update banner images uploaded from the admin app.
-- Separate from character-images since it's a different content type/lifecycle.

insert into storage.buckets (id, name, public)
values ('update-images', 'update-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read access for update images" on storage.objects;
create policy "Public read access for update images"
  on storage.objects
  for select
  using (bucket_id = 'update-images');

-- TEMPORARY: mirrors the open write policy on character-images — no admin auth yet.
drop policy if exists "Temporary open write access for update images" on storage.objects;
create policy "Temporary open write access for update images"
  on storage.objects
  for all
  using (bucket_id = 'update-images')
  with check (bucket_id = 'update-images');
