-- Public feedback/bug-report form. Anyone can submit, including anonymous visitors
-- (this is deliberately not gated behind login — feedback should be as low-friction as
-- possible). Only admins can read submissions; there is no public listing of feedback.

create table if not exists public.feedback (
  id text primary key,
  message text not null,
  contact text,
  created_at timestamptz not null default now()
);

create index if not exists feedback_created_at_idx on public.feedback (created_at desc);

alter table public.feedback enable row level security;

drop policy if exists "Anyone can submit feedback" on public.feedback;
create policy "Anyone can submit feedback"
  on public.feedback
  for insert
  with check (true);

drop policy if exists "Admins can read and delete feedback" on public.feedback;
create policy "Admins can read and delete feedback"
  on public.feedback
  for select
  using (public.is_admin());

drop policy if exists "Admins can delete feedback" on public.feedback;
create policy "Admins can delete feedback"
  on public.feedback
  for delete
  using (public.is_admin());
