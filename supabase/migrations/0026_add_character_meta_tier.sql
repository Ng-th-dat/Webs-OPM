-- Meta tier list ranking: how strong a character currently is in the live meta, distinct from
-- `rarity` (gacha drop-rate grade) and `rank` (Hero Association/threat lore class, unrelated to
-- gameplay strength). Nullable — existing characters start unranked until an admin assigns a
-- tier from the admin app; the public site only ever reads this column. The existing
-- is_admin()-gated "for all" write policy on `characters` (0008) already covers this new column,
-- so no new RLS policy is needed here.

alter table public.characters
  add column if not exists meta_tier text
  check (meta_tier in ('D', 'C', 'B', 'A', 'S', 'S+', 'SS+', 'Tốc', 'Core'));
