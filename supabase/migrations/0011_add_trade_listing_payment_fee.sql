-- Posting fee: a fixed, disclosed platform fee (currently 5,000 VND) to help cover
-- server costs — not a payment for the account being traded, which S-Class Codex still
-- never touches. Collected manually (bank/MoMo transfer, same account as the donate
-- widget) since there is no payment gateway integration; the poster uploads a screenshot
-- of the transfer, and the admin checks it alongside the listing's content before
-- approving. No separate "payment verified" flag — approval already means both content
-- and payment proof were reviewed together.

alter table public.trade_listings
  add column if not exists payment_proof_url text not null;
