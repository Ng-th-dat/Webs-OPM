-- Soft-delete support: admin "delete" now just hides a character from the public
-- site instead of removing the row, so nothing in the characters table is ever
-- destroyed by the admin app.

alter table public.characters
  add column if not exists is_visible boolean not null default true;

create index if not exists characters_is_visible_idx on public.characters (is_visible);
