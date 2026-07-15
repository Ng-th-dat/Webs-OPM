-- Lets each character carry its own debut/comeback timing directly, so the homepage
-- "upcoming releases" spotlight can be derived straight from characters instead of a
-- manually-maintained release_schedule row per event. Shared across CN/SEA (one value,
-- not per-server) and only the current/next comeback is tracked (not a history list).

alter table public.characters
  add column if not exists debut_month int check (debut_month between 1 and 12),
  add column if not exists debut_year int check (debut_year >= 2020),
  add column if not exists debut_timing text check (debut_timing in ('Start of Month', 'Mid Month', 'End of Month')),
  add column if not exists comeback_month int check (comeback_month between 1 and 12),
  add column if not exists comeback_year int check (comeback_year >= 2020),
  add column if not exists comeback_timing text check (comeback_timing in ('Start of Month', 'Mid Month', 'End of Month'));
