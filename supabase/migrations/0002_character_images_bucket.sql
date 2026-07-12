-- Public storage bucket for character images uploaded from the admin app
-- (portraits, skill icons, passive icon, awakening art). Replaces manually
-- dropping files into public/characters/<slug>/ for anything added post-launch.

insert into storage.buckets (id, name, public)
values ('character-images', 'character-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read access for character images" on storage.objects;
create policy "Public read access for character images"
  on storage.objects
  for select
  using (bucket_id = 'character-images');

-- TEMPORARY: mirrors the open write policy on public.characters — no admin auth
-- yet, so anyone with the anon key can upload/replace/delete images. Tighten
-- alongside the characters table policy once auth is wired up.
drop policy if exists "Temporary open write access for character images" on storage.objects;
create policy "Temporary open write access for character images"
  on storage.objects
  for all
  using (bucket_id = 'character-images')
  with check (bucket_id = 'character-images');
