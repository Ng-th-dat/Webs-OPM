-- Thin image registry for Ticket Calculator sources (black ticket / STK ticket sources),
-- keyed by the source ids in src/data/ticketSources.ts. Mirrors 0021_create_mastery_materials.sql —
-- ticket sources stay local TS, this table only holds the icon URL per source.

create table if not exists public.ticket_source_images (
  source_id text primary key,
  image_url text,
  updated_at timestamptz not null default now()
);

alter table public.ticket_source_images enable row level security;

drop policy if exists "Public read access" on public.ticket_source_images;
create policy "Public read access"
  on public.ticket_source_images
  for select
  using (true);

drop policy if exists "Admin write access" on public.ticket_source_images;
create policy "Admin write access"
  on public.ticket_source_images
  for all
  using (public.is_admin())
  with check (public.is_admin());
