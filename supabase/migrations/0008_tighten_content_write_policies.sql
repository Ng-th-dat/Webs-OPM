-- Replaces every "Temporary open write access" policy from 0001/0002/0004/0005/0006
-- with an admin-gated one, now that the admin app has real login (see AuthContext +
-- RequireAdmin) and public.is_admin() exists (0007). Public read access is untouched —
-- the public site keeps browsing anonymously.
--
-- IMPORTANT bootstrap order: apply this only after at least one row exists in
-- public.admins (Supabase Dashboard -> Authentication -> Users -> Add user, then
-- `insert into public.admins (user_id) values ('<uuid>');` in the SQL editor).
-- Applying this first would lock out the legitimate admin along with everyone else.

drop policy if exists "Temporary open write access" on public.characters;
create policy "Admin write access"
  on public.characters
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Temporary open write access" on public.release_schedule;
create policy "Admin write access"
  on public.release_schedule
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Temporary open write access" on public.game_updates;
create policy "Admin write access"
  on public.game_updates
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Temporary open write access for character images" on storage.objects;
create policy "Admin write access for character images"
  on storage.objects
  for all
  using (bucket_id = 'character-images' and public.is_admin())
  with check (bucket_id = 'character-images' and public.is_admin());

drop policy if exists "Temporary open write access for update images" on storage.objects;
create policy "Admin write access for update images"
  on storage.objects
  for all
  using (bucket_id = 'update-images' and public.is_admin())
  with check (bucket_id = 'update-images' and public.is_admin());
