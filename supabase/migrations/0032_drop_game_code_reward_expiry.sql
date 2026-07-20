-- Game codes no longer track a reward description or expiry date — the public site only
-- ever shows a code while it's still active, so a plain "still active" indicator (driven by
-- the existing status column) replaces both fields instead.

alter table public.game_codes drop column if exists reward;
alter table public.game_codes drop column if exists expires_at;
