-- Thin image registry for Mastery materials (Type Manual, Gold, Faction Certificate, etc.),
-- keyed by the materialId literals already used in src/data/mastery.ts. Mastery itself stays
-- local TS (tiers, stat gains, quantities, requirements) — this table only holds the icon URL
-- per material so the admin app can manage them, matching how character/update images work.

create table if not exists public.mastery_materials (
  material_id text primary key,
  image_url text,
  updated_at timestamptz not null default now()
);

alter table public.mastery_materials enable row level security;

drop policy if exists "Public read access" on public.mastery_materials;
create policy "Public read access"
  on public.mastery_materials
  for select
  using (true);

drop policy if exists "Admin write access" on public.mastery_materials;
create policy "Admin write access"
  on public.mastery_materials
  for all
  using (public.is_admin())
  with check (public.is_admin());
