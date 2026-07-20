# S-Class Codex — Project Documentation

## 1. Project Overview

**S-Class Codex** is a wiki + gaming tools website for the game **One Punch Man**. It helps players quickly look up character data, track the character release schedule, and calculate stats/resources through dedicated tools.

**Goal:** Give players a fast, clear, and visual way to look up game information and run calculations — character data, release schedule, Spec ATK/DEF, Mastery, and Core-Lab.

**Core modules:**
- Character data
- Character release schedule
- Stat calculator
- Mastery data
- Core-Lab data
- Core-Lab resource calculator

**Design feel:** modern, minimal, professional — with a gaming/wiki-database identity. Not a cartoonish or childish website.

---

## 2. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | React (SPA, Vite) | **No Next.js**, no full-stack framework |
| Language | TypeScript | Strict typing throughout |
| Build tool | Vite | Fast dev server, zero-config build |
| Styling | Tailwind CSS | Utility-first, consistent design tokens |
| Routing | React Router DOM | Client-side routing |
| Data | Supabase (Postgres) for characters/game updates/Intel dossiers; local TS modules for the rest | See "Data Backend" below |
| Admin | Separate Vite+React+TS app in `admin/` | Writes characters directly to Supabase; not part of the public site's build. Also depends on `recharts` for `DashboardPage` charts — admin-only, not a main-site dependency |
| Deployment target | Vercel, Netlify, or GitHub Pages | Static SPA build |

**Hard constraints:**
- React + TypeScript + Vite + Tailwind CSS only.
- No Next.js or any full-stack/SSR framework.
- No custom backend/API server — Supabase (Postgres + its auto REST API) is the only backend, used directly from the browser via `@supabase/supabase-js`. Don't add an Express/Node API layer on top of it.
- Component-based architecture, clean and easy to extend.

### Data Backend

Character data, Character Intel, and Game Updates live in Supabase, not local mock data:
- Schema/RLS: `supabase/migrations/0001_create_characters.sql`, `0005_create_game_updates.sql`, `0028_create_character_intel.sql`. Seed data: `supabase/seed.sql`. (`0004_create_release_schedule.sql` also exists but backs an orphaned table — see "Release timing" in section 6.)
- Public site reads characters via `src/lib/api/characters.ts` (`fetchCharacters`, `fetchCharacterBySlug`) through `src/hooks/useCharacters.ts` / `useCharacter.ts`, Intel dossiers via `src/lib/api/characterIntel.ts` through `src/hooks/useCharacterIntel.ts` / `useCharacterIntelEntry.ts`, Game Updates via `src/lib/api/gameUpdates.ts` (`fetchGameUpdates`, `fetchGameUpdateBySlug`) through `src/hooks/useGameUpdates.ts` / `useGameUpdate.ts`, the SEA server schedule via `src/lib/api/seaServers.ts` (`fetchSeaServers`) through `src/hooks/useSeaServers.ts`, and active SEA redeem codes via `src/lib/api/gameCodes.ts` (`fetchGameCodes`, filtered to `status = 'active'`) through `src/hooks/useGameCodes.ts`. Every consumer must handle loading/error states (`LoadingState`, `EmptyState`) — Supabase is a network call, not a synchronous import.
- The standalone `admin/` app (own `package.json`, own Supabase client, not routed through the main site) is where characters get added/edited/hidden/tier-ranked — `admin/src/lib/characters.ts` + `admin/src/pages/CharacterFormPage.tsx` (add + edit share one component, routed at `characters/new` and `characters/:id/edit`) / `CharacterListPage.tsx` — where Intel dossiers are managed — `admin/src/lib/characterIntel.ts` + `admin/src/pages/IntelFormPage.tsx` / `IntelListPage.tsx` (add + edit share one component, routed at `intel/new`, `intel/:id/edit`) — where Game Updates are managed — `admin/src/lib/gameUpdates.ts` + `admin/src/pages/UpdateFormPage.tsx` / `UpdatesListPage.tsx` (routed at `updates`, `updates/new`, `updates/:id/edit`; a real SQL delete, unlike characters — a news feed, not character content) — and where the SEA server schedule is managed — `admin/src/lib/seaServers.ts` + `admin/src/pages/SeaServerFormPage.tsx` / `SeaServersPage.tsx` (routed at `sea-servers`, `sea-servers/new`, `sea-servers/:id/edit`; also a real SQL delete) — and where SEA redeem codes are managed — `admin/src/lib/gameCodes.ts` + `admin/src/pages/GameCodeFormPage.tsx` / `GameCodesPage.tsx` (routed at `game-codes`, `game-codes/new`, `game-codes/:id/edit`; also a real SQL delete, and status — `active`/`expired` — is a plain admin-set field rather than derived, since a publisher often kills a code early with no announced date). Image uploads go through `admin/src/components/ImageUpload.tsx` + `admin/src/lib/storage.ts` into the `character-images` Storage bucket (`supabase/migrations/0002_character_images_bucket.sql`), update banners through `admin/src/components/UpdateImageUpload.tsx` + `admin/src/lib/updateImageStorage.ts` into the `update-images` bucket (`supabase/migrations/0006_update_images_bucket.sql`), and Intel images through `admin/src/components/IntelImageUpload.tsx` + `admin/src/lib/intelImageStorage.ts` into the `intel-images` bucket (`supabase/migrations/0029_intel_images_bucket.sql`) — see "Image Assets" below. The SEA server schedule has no image field, so no Storage bucket.
- **Character deletion is soft** — `characters.is_visible` (`supabase/migrations/0003_character_visibility.sql`, default `true`) is toggled off by the admin list's hide action (`setCharacterVisibility`) instead of ever running a SQL `delete`. The public site's `fetchCharacters`/`fetchCharacterBySlug` filter to `is_visible = true`; the admin's equivalents return every row (including hidden) so they can be found and restored, typed as `AdminCharacter` (`Character & { isVisible: boolean }`) rather than widening the shared `Character` type.
- Every data-mutating action in the admin app (create/update/hide/show/delete) goes through `useConfirm()` (`admin/src/components/ConfirmDialog.tsx`) for an in-app confirmation modal before it runs, and reports success/failure via `useToast()` (`admin/src/components/Toast.tsx`) — never a bare `window.confirm`/`alert`.
- **AI-assisted Game Update drafting**: the publisher only ever sends an event banner image (no text), so the admin's Update form has an "Analyze with AI" button (`admin/src/lib/aiAnalyze.ts` → `supabase.functions.invoke('analyze-update-image', ...)`) that sends the uploaded banner's public Storage URL to the `analyze-update-image` Supabase Edge Function (`supabase/functions/analyze-update-image/index.ts`). That function calls the Anthropic Messages API server-side — image input via `{type: "image", source: {type: "url", url}}`, and forced tool use (`tool_choice` pinned to one `strict: true` tool) so the response is guaranteed-valid structured JSON (title/description/category/server/date/events, each event's own startDate/endDate) rather than free text to parse — and returns it for the admin to review/edit before publishing. **`ANTHROPIC_API_KEY` is a Supabase Edge Function secret** (`supabase secrets set ANTHROPIC_API_KEY=...`), read via `Deno.env.get(...)` inside the function; it never reaches the browser bundle. This Edge Function is the one sanctioned way to call a third-party API from this project — it's still "just Supabase," so it doesn't license adding a general-purpose Node/Express backend elsewhere. (Per `admin/src/pages/UpdateFormPage.tsx`'s `AI_ANALYZE_ENABLED` flag, this button is currently switched off pending Anthropic billing being set up — manual entry always works regardless.)
- **Auth is wired up (Supabase Auth) for both apps** — see "Temporarily unmounted" in section 5 for the main site's current login/Trade Listings/wallet status. The admin app requires the operator to be signed in **and** listed in the `admins` table. `characters`/`game_updates`/`character_intel` writes and the `character-images`/`update-images`/`intel-images` bucket writes are gated by `public.is_admin()` (`supabase/migrations/0007_create_admins.sql`, `0008_tighten_content_write_policies.sql`) — no more open anon-key writes. Bootstrapping the first admin is manual: Supabase Dashboard → Authentication → Users → Add user, then `insert into public.admins (user_id) values ('<uuid>');` in the SQL editor. There is no self-service admin signup UI anywhere, by design.
- Mastery and Core-Lab tier/stat/material data is **still local TS mock data** (`src/data/*.ts`) — only Mastery material *icons* have moved to Supabase (`materials` image registry, `supabase/migrations/0021_create_mastery_materials.sql`, keyed by the `materialId` literals already in `src/data/mastery.ts`); the tiers/stat gains/quantities themselves have not moved. Follow the same pattern (migration + `lib/api/*` + hook) for the rest if/when it does; don't silently mix a Supabase-backed field into an otherwise-local data file.
- Env vars: `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, set per-app in `.env.local` (see `.env.local.example` at the root and in `admin/`). Never commit real keys.

### Authentication & Trade Listings

**Main-site login, Trade Listings, and the wallet are currently unmounted** from `AppRoutes.tsx`/`Header` — see "Temporarily unmounted" in section 5. Everything below (data model, RLS, triggers, admin moderation) is otherwise unchanged and accurate; it's describing real, working code that just isn't reachable from the live site's nav/routes right now. Admin auth/login is unaffected.

- **Main site login is a modal, not a page** — there is no `/login` route. `src/context/AuthContext.tsx` + `src/hooks/useAuth.ts` handle `supabase.auth` (email/password only); `initializing` covers the async session-restore window (unlike `LanguageContext`, which reads `localStorage` synchronously). `src/context/LoginModalContext.tsx` (`LoginModalProvider` + `useLoginModal()`) tracks open/closed state globally; `src/components/auth/LoginModal.tsx` is mounted once in `AppLayout` and renders on top of whatever page the user is on. `src/routes/RequireAuth.tsx` opens the modal (via `useEffect`) instead of navigating away when a protected route (`/trade/new`, `/trade/:id/edit`, `/trade/mine`) is hit while signed out — the guarded route just stays put and renders once `user` becomes non-null after a successful login, no redirect-and-back-again needed. `src/components/layout/AccountMenu.tsx` (desktop popover + `AccountMenuItems` reused for `MobileDrawer`'s stacked mobile nav) opens the same modal via `useLoginModal().open()` when signed out, or shows the signed-in user's email/logout/My Listings.
- **Admin app** (`admin/src/context/AuthContext.tsx` + `admin/src/hooks/useAuth.ts`) keeps its own full-page `/login` (unrelated to the main site's modal — separate app, separate UX) and models auth as a discriminated union (`loading | signed-out | forbidden | authorized`) since being signed in and being an admin are separate checks (`supabase.rpc('is_admin')` after session resolves) — avoids representing impossible states. `admin/src/routes/RequireAdmin.tsx` gates the entire `AdminLayout` route tree; a `forbidden` account sees a plain "not an admin" page with a sign-out button rather than being redirect-looped back to `/login`. `admin/src/lib/supabase.ts` sets a distinct `auth.storageKey` (`sclass-admin-auth`) so the two apps' sessions can never collide in `localStorage` if they ever end up same-origin.
- **Trade Listings** (`trade_listings` table, `supabase/migrations/0009_create_trade_listings.sql`): a pure classifieds board for account trading — the site never handles payment **for the traded account itself** (that was explicitly considered and rejected, including disguising the account-sale payment as "donations," as deceptive to payment processors). Logged-in users submit listings (`status: 'pending'`); every listing needs admin approval (`status: 'approved'`) before it's public. RLS `insert` requires `status = 'pending'` (blocks a direct API call from self-approving), and a `before update` trigger (`enforce_trade_listing_transitions()`) — not just RLS `with check`, which can't compare old-vs-new rows — resets an edited **approved** listing back to `pending` unless the edit is a pure "mark as sold" transition, closing a moderation-bypass where someone edits an already-approved listing's content. Unlike `characters.is_visible`, this table uses a **real hard delete** (user-owned, transient rows, nothing else FKs into them). Images go in the `trade-listing-images` bucket, path `<user_id>/<listing_id>/<file>`, uploaded before the row exists via the same `draftId = crypto.randomUUID()` pattern `admin/src/pages/UpdateFormPage.tsx` uses. Public site: `src/lib/api/tradeListings.ts` + `src/hooks/useTradeListings.ts`/`useTradeListing.ts`/`useMyTradeListings.ts`, pages `TradePage`/`TradeListingDetailPage`/`TradeListingFormPage`/`MyTradeListingsPage`/`TradeDisclaimerPage`. Admin moderation: `admin/src/lib/tradeListings.ts`, pages `TradeListingsPage`/`TradeListingDetailPage` (approve, or reject with a required reason).
- **Posting fee** — this IS a real, disclosed platform fee (5 phiếu/listing, `enforce_trade_listing_fee()` in `supabase/migrations/0015_trade_listing_phieu_fee.sql`) charged for using the board itself, not for the account being traded — different in kind from the rejected "disguised donation" idea, since it's transparently labeled and doesn't touch the sale price. It's deducted atomically from the poster's `profiles.phieu_balance` at insert time (a `before insert` trigger, `for update`-locked to close a check-then-deduct race) rather than requiring a fresh bank transfer + screenshot on every single listing — that per-listing screenshot flow (`0011_add_trade_listing_payment_fee.sql`) was replaced once the phiếu wallet (below) shipped; `trade_listings.payment_proof_url` was dropped in `0015`.
- **Phiếu wallet & top-ups** (`profiles.phieu_balance`, `phieu_topups` table — `supabase/migrations/0013_create_profiles.sql`, `0014_create_phieu_topups.sql`, `0017_sepay_auto_topup.sql`): 1 phiếu = 1,000₫, used to pay the Trade Listing posting fee above. Users buy phiếu at `/wallet` (`src/pages/WalletPage.tsx` + `src/hooks/usePhieuBalance.ts`/`useMyTopups.ts` + `src/lib/api/wallet.ts`) — pick a package (`PHIEU_PACKAGES` in `src/utils/wallet.ts`), transfer via the shown VietQR (`buildVietQrUrl()`/`DONATE_ACCOUNT_HOLDER`/`DONATE_ACCOUNT_NUMBER`, `src/utils/donate.ts`, shared with `DonateWidget`) using a per-request `transfer_code` (`NAPPHIEU <8-char code>`, generated client-side and persisted on the `phieu_topups` row so it can be matched later), and submit — a payment screenshot (`wallet-topup-proofs` bucket, `uploadTopupProof` in `src/lib/walletImageStorage.ts`) is optional evidence only, not a submission gate. Two credit paths, both landing on the same `phieu_topups.status`:
  - **Auto (primary)** — SePay is linked to the site's MBBank account (`DONATE_ACCOUNT_NUMBER` in `src/utils/donate.ts`) and POSTs a webhook to `supabase/functions/sepay-webhook/index.ts` on every incoming transaction. The function normalizes the transfer content, extracts the `NAPPHIEU` code, and calls `auto_approve_phieu_topup()` (`0017`) — a `security definer` function granted **only to `service_role`** (not `authenticated`, unlike the admin RPC below), called using the Edge Function's service-role key so it bypasses RLS entirely and can never be invoked by a client session. It matches on `transfer_code` + `amount_vnd`, credits `phieu_balance`, and sets `auto_matched = true`; a `sepay_transaction_id` partial-unique index makes repeated webhook deliveries for the same transaction idempotent. Deployed with `supabase functions deploy sepay-webhook --no-verify-jwt` (server-to-server, no Supabase JWT) and gated by the `SEPAY_WEBHOOK_API_KEY` Edge Function secret — the second sanctioned third-party integration alongside `analyze-update-image`, this one inbound rather than outbound.
  - **Manual (fallback)** — a transfer the webhook can't match (wrong content/amount, or SePay not reachable) stays `pending` for an admin to resolve exactly as before: `admin/src/lib/wallet.ts` + `admin/src/pages/TopupsPage.tsx`/`TopupDetailPage.tsx`, approve via `approve_phieu_topup()` (`0014`, `is_admin()`-gated, granted to `authenticated`) or reject with a reason. The admin list defaults to filtering on `pending` so auto-matched top-ups (tagged `Auto` vs `Manual` in the UI via `auto_matched`) don't need attention unless something needed manual review.
- **Feedback** (`feedback` table, `supabase/migrations/0012_create_feedback.sql`): a public, no-login-required form at `/feedback` (`src/pages/FeedbackPage.tsx` + `src/lib/api/feedback.ts`) — message + optional contact info. RLS: `insert` is open to everyone (`with check (true)`, including anonymous visitors — feedback is deliberately zero-friction), `select`/`delete` are `is_admin()`-gated. A scrolling `MarqueeBanner` (`src/components/layout/MarqueeBanner.tsx`, mounted in `AppLayout` right below `Header`) links to `/feedback` site-wide; dismissible per session (plain component state, not persisted). Admin reviews/clears submissions at `admin/src/pages/FeedbackPage.tsx` (`admin/src/lib/feedback.ts`) — read + hard delete, no edit.
- **Icon registries for local-data features** — Mastery materials and Ticket Calculator sources keep their tier/cost/amount data as local TS (`src/data/mastery.ts`, `src/data/ticketSources.ts`) but source their *icons* from Supabase, via the same thin pattern: a table keyed by the existing string id (`material_id` / `ticket_type`) holding just an `image_url`, admin-managed at `admin/schedule`-style single-purpose pages — `mastery_materials` (`supabase/migrations/0021_create_mastery_materials.sql`, bucket `0022`) via `admin/src/pages/MasteryMaterialsPage.tsx` + `admin/src/lib/masteryMaterials.ts`/`masteryMaterialImageStorage.ts`, read on the public site through `src/hooks/useMasteryMaterialImages.ts`; `ticket_type_images` (`0023`→renamed by `0025`, bucket `0024`) via `admin/src/pages/TicketTypeImagesPage.tsx` + `admin/src/lib/ticketTypeImages.ts`/`ticketTypeImageStorage.ts`, read through `src/hooks/useTicketTypeImages.ts`. `ticket_type_images` also covers a third, non-ticket type (`topup`) for the floating Top Up button's icon (`0027_add_topup_ticket_type.sql`) — reused rather than adding a whole new registry for one icon.
- **Admin Dashboard** (`admin/src/pages/DashboardPage.tsx`, the admin app's index route) — read-only analytics, no new table: stat tiles (visible character count, pending trade listings, pending top-ups, feedback received in the last 7 days) plus `recharts` charts (7-day activity line across trade listings/top-ups/feedback, rarity breakdown bar, trade-status pie, revenue) computed client-side from `fetchCharacters`/`fetchAllTradeListings`/`fetchAllTopups`/`fetchAllFeedback`, bucketed by day via `admin/src/lib/dashboardStats.ts`. `recharts` is an admin-only dependency (`admin/package.json`), not used by the main site.

---

## 3. Design Direction

### Style
- Modern, minimal, professional, gaming-inspired — premium editorial polish, not a plain dashboard
- Dark mode first, with layered ambient background glow (soft blurred radial color blobs behind content) for depth
- Homepage is a single full-width `HeroSection` — bold headline, short subhead, dual CTAs, a real-data stats row (character count, upcoming releases, rarity tiers), a live current-month release spotlight (`getCurrentMonthSpotlightEntries()`, derived from each `Character`'s own debut/comeback fields) with idle floating + 3D perspective tilt on the cards, and a latest-rumor Intel alert strip. No feature grid below it — other modules are reachable via the header nav instead; the homepage's whole job is a strong, self-contained first impression
- Compact density on data pages: sticky search/filter bar styled as a bordered "control panel" card, tight card padding, scan-friendly grids — favor fitting more real information over decorative whitespace on `/characters`, `/intel`
- Rarity-aware glow: interactive cards (`CharacterCard`, `CharacterDetail` overview) set a `--card-glow` CSS custom property (from `RARITY_GLOW`) inline per-instance, then reference it in a static Tailwind arbitrary-value hover shadow (e.g. `hover:shadow-[0_20px_45px_-18px_var(--card-glow)]`) — gives per-rarity color without generating dynamic Tailwind classes
- Generous spacing, readable typography, fully responsive: mobile, tablet, desktop
- Community fan-site tone: confident and useful, not corporate — still professional, never cluttered
- Two visual registers, picked by what an element is attached to — don't mix them on one component, and don't default to whichever was used most recently: **comic-poster** (header/nav and anything directly attached to it — black `comic-pill` clipped-parallelogram buttons, bold uppercase text, `comic-pill--active` gold fill, hard offset drop-shadows, orange/red halftone `comic-surface`/`comic-jagged-*`, `animate-panel-slam` with small alternating rotations for a "hand-placed sticker" entrance) vs. **HUD-console** (standalone content-page panels on the dark canvas — `comic-dots` halftone at ~0.05 opacity, `rounded-card` bordered `bg-surface`, `animate-rise-in`/`animate-panel-slam` reveals). Within HUD-console, reserve the `HudCorners` component + a soft radial glow for the single hero/reward moment on a page (e.g. `FeedbackPage`'s post-submit stamp) — a dense list or a plain form on that same page stays a calm bordered card with no corners/glow, or it reads as cluttered.
- A page's **one** hero/spotlight moment specifically should reach for `comic-panel-torn` (the jagged-edge clip-path + `border-4` + colored border + `shadow-[6px_6px_0_rgba(0,0,0,0.35)]` + `animate-panel-slam`) before reaching for the plainer `HudCorners` console shell — it's the site's single most-repeated "featured thing" shape (`HeroSection`'s CN/SEA spotlight cards, `SeaServersPage`'s Next-Launch card), and a hero built on it reads as belonging to this product; one built on a generic bordered console, even if internally consistent, can still read as "a different app's design system" bolted on.

### Color Palette

```css
/* Background */
--bg-primary:   #0a0e14;   /* deep navy / charcoal black */
--bg-surface:   #12161f;   /* card / panel surface */
--bg-elevated:  #1a1f2b;   /* elevated surface (modals, dropdowns) */

/* Accent */
--accent-primary:   #ff4d4d;  /* red — primary CTA / highlight */
--accent-secondary: #ffb020;  /* orange/yellow — secondary highlight */
--accent-info:      #3da9fc;  /* neon blue — links, info states */

/* Text */
--text-primary:   #f5f6fa;
--text-secondary: #9aa3b2;
--text-muted:     #5c6470;

/* Borders */
--border: rgba(255,255,255,0.08);

/* Ambient background glow (used behind hero/layout, blurred radial blobs) */
--color-accent-glow: rgba(255, 77, 77, 0.18);
--color-glow-blue:   rgba(61, 169, 252, 0.16);
--color-glow-purple: rgba(169, 112, 255, 0.18);

/* Rarity colors (distinct, high-contrast), highest to lowest tier */
--rarity-ur-plus: #ff4d9f;  /* magenta/pink */
--rarity-ur:      #a970ff;  /* purple */
--rarity-ssr-plus: #ffb020; /* gold */
--rarity-ssr:     #ff8a3d;  /* orange */
--rarity-sr:      #22c3a6;  /* teal */
--rarity-r:       #6bcf7f;  /* green */
--rarity-n:       #8a94a6;  /* slate gray */
```

Rules:
- Never hardcode hex colors inline — define as Tailwind theme tokens / CSS variables.
- Each rarity must have a distinct, consistent color used everywhere (badges, cards, tables, calendar).
- `utils/rarity.ts` exports `RARITY_STYLES` (border + text Tailwind classes) and `RARITY_GLOW` (rgba glow-tint strings for hover shadows) — reuse both rather than re-deriving colors per component.
- Gradients allowed but must stay subtle — no loud/rainbow gradients.

### Typography
- Sans-serif, highly legible at small sizes (data-dense tables/cards).
- Headings: weight 600–700, tight letter-spacing.
- Body: weight 400, line-height 1.5–1.6 for readability in tables.
- Minimum body text size: 14px desktop / 16px mobile.

### Spacing & Layout
- Container max-width ~1280px, centered, `px-4` mobile → `px-8` desktop.
- Card border-radius: `12px`. No hard shadows — use subtle borders (`1px solid var(--border)`).
- Consistent gap scale (Tailwind default spacing scale) across grids and cards.

---

## 4. Main Features

### 4.1 Tier List
- `/tier-list` (`TierListPage`) reads every character's optional `metaTier` field (`Character.metaTier`, `D → C → B → A → S → S+ → SS+ → Tốc → Core`, weakest to strongest — see `META_TIER_ORDER` in `src/utils/metaTier.ts`) and groups them into one row per tier, strongest first; characters with no `metaTier` set land in a separate "Unranked" row instead of being hidden.
- Read-only on the public site — there's no separate tier-list table. An admin sets/changes a character's tier from the character list (`setCharacterMetaTier()` in `admin/src/lib/characters.ts`, called from `CharacterListPage.tsx`), which just writes the `meta_tier` column added by `supabase/migrations/0026_add_character_meta_tier.sql`.

### 4.2 All Characters Database
- Full character list (24+ characters) with real-time search (name, type, faction, role, tags) and filters (tier/rarity, type, faction, role, combinable).
- Each character has a detail page at `/characters/:slug` with a larger portrait, full kit, and strengths/weaknesses.
- Card shows portrait, name, rarity badge, type/faction/role, tags, a short recommended-usage line, and a View Details affordance.

### 4.3 Spec ATK/DEF Calculator
- **Not built yet** — `/spec-calculator` currently renders `ComingSoonPage`, a placeholder. The design intent below is still the target once it's built.
- User inputs current stats and upgrade parameters (level, enhancement values).
- Tool computes resulting Spec ATK/DEF.
- Simple, mobile-friendly form + clear result panel.

### 4.4 Mastery Data
- Table of Mastery levels: stat bonuses, required materials, optimization notes.
- Filterable/searchable data table.

### 4.5 Core-Lab Data
- Table/upgrade-path view of Core-Lab levels: effect, stat bonus, required materials.

### 4.6 Core-Lab Resource Calculator
- **Not built yet** — `/core-lab-calculator` currently renders `ComingSoonPage`, a placeholder. The design intent below is still the target once it's built.
- User inputs current level and target level.
- Tool computes total required resources, broken down by resource type.

### 4.7 Intel (Pre-Release Character Dossiers)
- `/intel` (`IntelPage`) and `/intel/:slug` (`IntelDetailPage`) — a dossier per rumored-but-unreleased character (`character_intel` table, `supabase/migrations/0028_create_character_intel.sql`), each accumulating a `hints` timeline (JSONB `IntelHint[]`) as leaks land, independent of the dossier's own `status` (`rumored | confirmed`).
- Each hint carries its own `confidence` (`rumor | likely | confirmed`) rather than the dossier having one confidence value — `getIntelRevealLevel()` (`src/utils/characterIntel.ts`) derives how in-focus the cover image renders (blurred/grayscale silhouette → fully clear) from the *highest* confidence hint reached so far, snapping to fully clear once `status` flips to `confirmed`.
- `ImageLightbox` opens the cover/hint image full-size on click; once the real character ships, an admin manually sets `confirmedCharacterSlug` to link the dossier to it — there's no auto-promotion pipeline.
- The homepage `HeroSection` surfaces the single latest `rumored` dossier as an alert strip (a `confirmed` dossier isn't worth interrupting the homepage for).
- Admin: `admin/src/pages/IntelListPage.tsx` / `IntelFormPage.tsx` (add + edit share one form, routed at `intel/new`, `intel/:id/edit`), image uploads via `admin/src/components/IntelImageUpload.tsx` + `admin/src/lib/intelImageStorage.ts` into the `intel-images` Storage bucket (`supabase/migrations/0029_intel_images_bucket.sql`).

### 4.8 New SEA Servers
- `/sea-servers` (`SeaServersPage`) — a chronological schedule of SEA server launches (`sea_new_servers` table, `supabase/migrations/0030_create_sea_new_servers.sql`), admin-entered one row at a time since the publisher announces each launch individually with no fixed cadence (not computed, unlike CN/SEA character timing).
- Each row is just `serverLabel` + `openDate` — everything else shown on the page is derived, not stored: `getSeaServerStatus()` (`src/utils/seaServers.ts`) buckets a server into `upcoming` / `new` (opened within the last 7 days) / `established` from `openDate` alone, and `getNextSeaServer()` picks the single nearest not-yet-open server for the page's hero "beacon" countdown. That hero card is built on `comic-panel-torn` (jagged clip-path + `border-4` + hard shadow), the same shape `HeroSection`'s CN/SEA spotlight cards use, rather than the plainer `HudCorners` console shell — see the design-register note in section 3.
- Admin: `admin/src/pages/SeaServersPage.tsx` / `SeaServerFormPage.tsx` (add + edit share one form, routed at `sea-servers/new`, `sea-servers/:id/edit`) — no image upload, so no Storage bucket.

### 4.9 Game Codes
- `/game-codes` (`GameCodesPage`) — active SEA-server redeem codes (`game_codes` table, `supabase/migrations/0031_create_game_codes.sql`, `0032_drop_game_code_reward_expiry.sql`), admin-entered one row at a time. Each `CodeCard` (`src/components/gameCodes/CodeCard.tsx`) shows the code in a dashed-border "voucher stub" box with a one-click copy button (`navigator.clipboard.writeText`, same pattern as `WalletPage`'s account-number copy) and a "Still active" badge — deliberately no reward text or expiry date, since the publisher rarely spells those out consistently and the one thing players actually need to know is whether the code still works.
- A code's `active`/`expired` status is a **plain admin-set field**, not derived from anything — there's no expiry date to compute from. The public site only ever fetches `status = 'active'` rows (`fetchGameCodes()`); expired codes stay visible to the admin (to flip back to active, or just for the record) but never appear on the public page — same "public sees a subset, admin sees everything" split as `characters.is_visible`, just enforced in the fetch query instead of RLS.
- Admin: `admin/src/pages/GameCodesPage.tsx` / `GameCodeFormPage.tsx` (add + edit share one form, routed at `game-codes/new`, `game-codes/:id/edit`) — no image upload, so no Storage bucket.

---

## 5. Pages / Routes

| Route | Page | Description |
|---|---|---|
| `/` | Home | Single-section premium landing: `HeroSection` only (headline, CTAs, stats row, live upcoming CN/SEA showcase, latest-rumor Intel alert strip) |
| `/characters` | Character Database | Searchable/filterable list of all characters |
| `/characters/:slug` | Character Detail | Full detail view for one character |
| `/tier-list` | Tier List | Read-only D→Core character rankings, grouped by `Character.metaTier` |
| `/updates` | Game Updates | Patch notes/events/CN news feed, filterable by category |
| `/updates/:slug` | Game Update Detail | Full update view; optional sub-event schedule with live expired/ongoing/coming-soon status |
| `/intel` | Intel | Pre-release character dossiers, filterable by rumored/confirmed |
| `/intel/:slug` | Intel Detail | Full dossier view; hint timeline, image lightbox |
| `/sea-servers` | New SEA Servers | Server launch timeline; hero countdown to the next one, derived upcoming/new/established status |
| `/game-codes` | Game Codes | Active SEA redeem codes, each copyable with one click; expired codes stay admin-only |
| `/core-lab` | Core-Lab | Core-Lab guide + resource calculator preview |
| `/spec-calculator` | Spec Calculator | Spec ATK/DEF calculator tool |
| `/core-lab-calculator` | Core-Lab Calculator | Core-Lab resource calculator tool |
| `/ticket-calculator` | Ticket Calculator | Projects black/STK ticket totals to a target date (next Debut/Comeback or a custom date), against the fixed monthly ticket sources in `src/data/ticketSources.ts` |
| `/calculators` | Calculators Hub | Links out to all three calculator tools |
| `/privacy-policy` | Privacy Policy | Legal-page-pattern static page |
| `/disclaimer` | Disclaimer | Legal-page-pattern static page |
| `/feedback` | Feedback | Public, no-login-required feedback form |

All routes are defined centrally (`src/routes/AppRoutes.tsx`) and rendered through `AppLayout`.

**Temporarily unmounted:** as of the July 2026 comic-poster redesign (commit "Redesign UI in a comic-poster style and add Tier List, Intel, and quick-action widgets"), `/trade`, `/trade/:id`, `/trade/disclaimer`, `/trade/new`, `/trade/:id/edit`, `/trade/mine`, `/wallet`, and `/mastery` are **not** in `AppRoutes.tsx` — main-site login/`AccountMenu` was hidden along with them (admin login is unaffected). The page components, `RequireAuth` guard, and every data model below describing these features are otherwise still accurate and unchanged — this was a deliberate "hide until the flow is confirmed" call, not a removal. Re-enabling means restoring their imports/`<Route>` entries in `AppRoutes.tsx` and `AccountMenu` in `Header`/`AppLayout`.

### Main navigation order
Home · Characters · Tier List · Updates · Intel · New SEA Servers · Game Codes · Ticket Calculator (`NAV_LINKS` in `src/routes/navigation.ts`) — plus a functional EN/VN language switcher (`Header`). Core-Lab and the Calculators hub are reachable via in-page links rather than top nav; Trade/Wallet/Mastery/the account menu are absent from nav while unmounted (see above).

---

## 6. Data Modeling

All types live in `src/types`. Character data lives in Supabase (see "Data Backend" in section 2); everything else's mock data lives in `src/data`. Components must never hardcode data inline.

### Character

Stored in Supabase's `characters` table (`supabase/migrations/0001_create_characters.sql`), one row per character. Nested shapes (`skills`, `passive`, `awakenings`, `core`) are JSONB columns holding the same shape as the TS interfaces below — no joins needed to render a character. DB columns are `snake_case` (`recommended_usage`, `release_version`, `release_status`); `src/lib/api/characters.ts` maps them to the camelCase `Character` shape the rest of the app uses. Never read/write the table directly from a component — go through `useCharacters`/`useCharacter` (site) or `admin/src/lib/characters.ts` (admin).

Four filterable dimensions: **rarity** (tier), **type** (combat archetype), **faction** (alignment), **role** (tactical role) — filter options for `type`/`role` are still derived from whatever the data contains via `getUniqueSortedValues(characters, key)` (`src/utils/characters.ts`), same mechanism regardless of whether the underlying field is a closed union or an open string. `rarity` and `faction` are closed unions (`Rarity`, `CharacterFaction`); `type`/`role` stay plain `string`. There's also a fifth, **non-filterable** dimension, `rank` (`CharacterRank`) — Hero Association class / monster threat level, lore/flavor only, independent of gacha `rarity` and not wired into `CharacterFilterValues`.

```ts
type Rarity = 'UR+' | 'UR' | 'SSR+' | 'SSR' | 'SR' | 'R' | 'N';   // highest to lowest
type CharacterFaction = 'Hero' | 'Monster' | 'Third-party';        // which side a character fights for
type CharacterRank = 'S-1' | 'S-2' | 'A' | 'Demon' | 'Dragon';      // lore/flavor rank, unrelated to rarity or metaTier
type SkillType = 'Attack' | 'Ultimate' | 'Passive' | 'Awaken Passive' | 'Core';

interface Character {
  id: string;
  name: string;
  slug: string;
  image: string;      // path under public/characters/; .gif preferred, .png/.webp/.jpg also supported
  rarity: Rarity;
  type: string;      // combat archetype, e.g. Duelist, Esper, Grappler, Hi-Tech
  faction: CharacterFaction;
  rank: CharacterRank;
  role: string;      // tactical role, e.g. DPS, Tank, Support, Core, Control, Healer, Utility
  metaTier?: 'D' | 'C' | 'B' | 'A' | 'S' | 'S+' | 'SS+' | 'Tốc' | 'Core';  // weakest to strongest; unset until an admin ranks it — drives /tier-list
  tags: string[];
  skills: Skill[];
  passive: Passive;
  awakenings?: AwakeningTier[];   // only shown for rarity SSR+/UR/UR+, and only when role isn't 'Core' (see core below)
  core?: CoreTier[];               // shown instead of awakenings for role: 'Core' characters (same rarity gate)
  strengths: string[];
  weaknesses: string[];
  recommendedUsage: string;
  releaseVersion: string;   // game version/patch the character was added in, e.g. "1.0", "1.2"
  releaseStatus: 'Upcoming' | 'Released' | 'TBD';
  // CN debut/comeback timing — SEA is derived automatically (CN + 4 months); drives the homepage spotlight and Ticket Calculator's "next release" target
  debutMonth?: number;
  debutYear?: number;
  debutTiming?: 'Start of Month' | 'Mid Month' | 'End of Month';
  comebackMonth?: number;   // only the current/next comeback is tracked, not a history list
  comebackYear?: number;
  comebackTiming?: 'Start of Month' | 'Mid Month' | 'End of Month';
}

// None of Skill/Passive/AwakeningTier/CoreTier carry a `name` — the UI labels them by
// position/skillType/tier instead. Every *Vi field is a Vietnamese translation of the
// field right above it, falling back to the English one when missing (see i18n note below
// — this is content translation, a deliberate exception to the "chrome only" i18n rule).
interface Skill {
  description: string;
  descriptionVi?: string;
  skillType?: SkillType;
  cost?: string;                      // resource cost as shown in-game, e.g. "None" or "2 Energy"
  upgradedDescription?: string;        // ultimate-only: full effect text once upgraded to 3-star
  upgradedDescriptionVi?: string;
  image?: string;                      // public/characters/<slug>/skill-{1-based index in skills[]}.png
}

interface Passive {
  description: string;
  descriptionVi?: string;
  goldDescription?: string;      // full effect text once the character reaches 5-star Gold
  goldDescriptionVi?: string;
  purpleDescription?: string;     // full effect text once the character reaches 5-star Purple
  purpleDescriptionVi?: string;
  image?: string;                  // public/characters/<slug>/passive.png, shared across all tiers
}

interface AwakeningTier {
  tier: number;
  description: string;
  descriptionVi?: string;
  requirement?: string;
  image?: string;   // public/characters/<slug>/awaken-{tier}.png
}

/** Core-Lab tier for role: 'Core' characters — replaces awakenings in the skill showcase. */
interface CoreTier {
  tier: number;
  name: string;
  description: string;
  descriptionVi?: string;
  requirement?: string;
  image?: string;   // public/characters/<slug>/core-{tier}.png
}
```

### Release timing (superseded `release_schedule` table)

There is **no** public-facing release-schedule page or route. Upcoming-release info (the homepage spotlight, Ticket Calculator's "next release" target) is derived directly from `Character.debutMonth`/`debutYear`/`debutTiming`/`comebackMonth`/`comebackYear`/`comebackTiming` (see the `Character` interface above) via `getNextUpcomingRelease()`/`getSpotlightEntriesInRange()`/`getUpcomingEntriesForServer()` in `src/utils/releaseSchedule.ts` — SEA timing is derived automatically as CN + 4 months, not stored separately.

The original `release_schedule` Supabase table (`supabase/migrations/0004_create_release_schedule.sql`), its site API/hook (`src/lib/api/releaseSchedule.ts`, `src/hooks/useReleaseSchedule.ts`, `src/types/releaseSchedule.ts`), and the **admin management pages** (`admin/src/pages/SchedulePage.tsx`/`ScheduleFormPage.tsx`, still routed at `admin/schedule`) predate this and are now orphaned — `supabase/migrations/0020_character_debut_comeback.sql`'s own comment says the per-character fields exist specifically to replace "a manually-maintained `release_schedule` row per event." Nothing on the public site reads this table anymore, but an admin can still add rows to it via the still-live admin UI, which won't visibly do anything. Flagged here rather than silently removed — worth a deliberate decision (wire the public site back up to it, or delete the table/hook/admin pages) rather than leaving it as silent dead code.

### Game Updates

Stored in Supabase's `game_updates` table (`supabase/migrations/0005_create_game_updates.sql`), one row per post. `events` is a JSONB column holding `UpdateSubEvent[]` directly — no join needed. `server` is nullable for posts that aren't server-specific (e.g. general patch notes); `type`/`server` map straight to the columns, no `buildEntry()`-style helper needed since there's no character FK to join.

Each sub-event's displayed date range and live status (expired/ongoing/upcoming) are both derived from `startDate`/`endDate` (ISO `YYYY-MM-DD`) via `formatEventDateRange()`/`getEventStatus()` in `src/utils/gameUpdates.ts` — there is no free-text date-range field; `UpdateDetailPage` shows an "Ongoing" or "Coming soon" (`common.comingSoon`) badge, or a muted/struck-through "Expired" treatment, and shows nothing for sub-events that predate this field (graceful degradation, no backfill). The admin form (`admin/src/pages/UpdateFormPage.tsx`) collects `startDate`/`endDate` as two required date inputs per sub-event, and the `analyze-update-image` Edge Function's tool schema extracts them directly from the banner image (resolving relative/no-year dates against "today").

```ts
type UpdateCategory = 'Update' | 'Event' | 'CnNews' | 'Maintenance';

interface UpdateSubEvent {
  title: string;
  note?: string;
  startDate?: string;   // ISO YYYY-MM-DD; omitted on sub-events created before this field existed
  endDate?: string;
}

interface GameUpdateEntry {
  id: string;
  slug: string;
  category: UpdateCategory;
  server?: 'CN' | 'SEA' | 'Global';   // tag shown on the card/detail page; omitted when not server-specific
  date: string;
  title: string;
  description: string;
  image?: string;                     // Supabase Storage URL for the banner, or a public/ path (legacy)
  events?: UpdateSubEvent[];           // optional date-range schedule shown on the detail page
}
```

### Character Intel

Stored in Supabase's `character_intel` table (`supabase/migrations/0028_create_character_intel.sql`), one row per rumored-but-unreleased character. `hints` is a JSONB column holding `IntelHint[]` directly — same events-as-JSONB pattern as `game_updates.events`. `confirmedCharacterSlug` is a manual, admin-set link to the real `characters.slug` once the character ships — there's no automatic promotion from intel to a real `Character` row.

```ts
type IntelStatus = 'rumored' | 'confirmed';
type IntelConfidence = 'rumor' | 'likely' | 'confirmed';   // per-hint, independent of the dossier's own IntelStatus

interface IntelHint {
  date: string;
  confidence: IntelConfidence;
  title: string;
  description?: string;
  image?: string;
}

interface CharacterIntelEntry {
  id: string;
  slug: string;
  status: IntelStatus;
  characterName: string;      // working/rumored name — may still change before confirmation
  rarityGuess?: Rarity;
  typeGuess?: string;
  factionGuess?: string;
  roleGuess?: string;
  summary?: string;
  coverImage?: string;
  hints: IntelHint[];
  confirmedCharacterSlug?: string;
  createdAt: string;
  updatedAt: string;
}
```

### New SEA Server

Stored in Supabase's `sea_new_servers` table (`supabase/migrations/0030_create_sea_new_servers.sql`), one row per server launch. Deliberately minimal — just a label and a date; live/upcoming/established status is computed, never stored (see `src/utils/seaServers.ts`).

```ts
interface SeaServerEntry {
  id: string;
  serverLabel: string;   // exactly as shown to players, e.g. "S45" — admin-entered free text, not an auto-incrementing int
  openDate: string;        // ISO YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}
```

### Game Code

Stored in Supabase's `game_codes` table (`supabase/migrations/0031_create_game_codes.sql`, `0032_drop_game_code_reward_expiry.sql`), one row per redeem code. Deliberately minimal — just a code and a status; no reward description or expiry date. `status` is a plain admin-set field, not derived — see "Game Codes" in section 4.9 for why. The public site's `fetchGameCodes()` filters to `status = 'active'`; the admin's equivalent returns every row (active + expired) so an expired code can still be found, edited, or flipped back.

```ts
type GameCodeStatus = 'active' | 'expired';

interface GameCodeEntry {
  id: string;
  code: string;             // exactly as players should type it, e.g. "OPM2026JULY"
  status: GameCodeStatus;
  createdAt: string;
  updatedAt: string;
}
```

### Trade Listing

Stored in Supabase's `trade_listings` table (`supabase/migrations/0009_create_trade_listings.sql`). See "Authentication & Trade Listings" above for the moderation-transition trigger and RLS design — this is the one table in the project with a real hard delete instead of a soft-delete flag.

```ts
type TradeListingStatus = 'pending' | 'approved' | 'rejected' | 'sold';

interface TradeListing {
  id: string;
  userId: string;
  title: string;
  description: string;
  priceText: string;              // free text ("500k", "thoả thuận") — never a real payment amount
  server: 'CN' | 'SEA' | 'Global';
  contactInfo: string;             // seller's own Zalo/Discord/FB/phone
  images: string[];                // trade-listing-images Storage URLs
  paymentProofUrl: string;          // screenshot proving the posting fee was transferred
  status: TradeListingStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Mastery Data

```ts
interface MasteryLevel {
  level: number;
  statBonus: StatBonus[];
  requiredMaterials: MaterialCost[];
  notes?: string;
}

interface StatBonus {
  stat: string;     // e.g. "ATK", "DEF", "HP"
  value: number;
  isPercent: boolean;
}

interface MaterialCost {
  materialId: string;
  materialName: string;
  quantity: number;
}
```

### Core-Lab Data

```ts
interface CoreLabLevel {
  level: number;
  effect: string;
  statBonus: StatBonus[];
  requiredMaterials: MaterialCost[];
}
```

### Calculator Data

```ts
// Spec ATK/DEF Calculator
interface SpecCalculatorInput {
  baseAtk: number;
  baseDef: number;
  currentLevel: number;
  targetLevel: number;
  enhancementBonus?: number;
}

interface SpecCalculatorResult {
  finalAtk: number;
  finalDef: number;
  atkGain: number;
  defGain: number;
}

// Core-Lab Resource Calculator
interface CoreLabCalculatorInput {
  currentLevel: number;
  targetLevel: number;
}

interface CoreLabCalculatorResult {
  totalMaterials: MaterialCost[];
  totalLevelsToUpgrade: number;
}

// Ticket Calculator — the first real (non-stub) calculator; local data in src/data/ticketSources.ts
interface TicketSource {
  id: string;
  ticketType: 'black' | 'stk';
  amount: number;
  timing: ReleaseTiming;      // 'Start of Month' | 'Mid Month' | 'End of Month'
  labelKey: TranslationKey;
  purchaseWindowEndDay?: number;  // day-of-month after which this source can no longer be claimed this month; undefined = no cutoff
}

interface TicketCalculatorInput {
  currentBlackTickets: number;
  currentStkTickets: number;
  claimedSourceIds: string[]; // this month's sources already claimed, excluded from the projection
  targetDate: string;
}

interface TicketCalculatorResult {
  projectedBlackTickets: number;
  projectedStkTickets: number;
  blackTicketsGained: number;
  stkTicketsGained: number;
  upcomingSources: { source: TicketSource; date: string }[];
}
```

Only `TicketSource`s with a real in-game purchase deadline set `purchaseWindowEndDay` (currently just the four "Start of Month" sources whose window closes on day 13 — `black-shop-early`, `black-event`, `black-login`, `stk-event`, `stk-login-early`; `stk-shop` is deliberately `Mid Month` timing with no cutoff since it can be bought any day). `src/utils/ticketCalculator.ts`'s `isPurchaseWindowClosed()` checks this generically (no hardcoded ticket-type branching); `calculateProjectedTickets()` excludes a closed-and-unclaimed source from the current month's projection entirely — this can make the total dip mid-month and recover once the target date reaches next month's own fresh window, which is correct, not a bug. `TicketCalculatorPage.tsx`'s `ClaimedChecklist` disables (but doesn't auto-toggle) the checkbox for a locked source and shows a "Passed" badge + tooltip.

---

## 7. Project Structure

```
src/
  components/
    layout/          # AppLayout, Header, Navigation, Footer, LanguageSwitcher, MobileDrawer, QuickActionsWidget, DonateWidget, TopupModal, MarqueeBanner, AccountMenu (unmounted — see "Temporarily unmounted" in section 5)
    common/           # Badge, RarityTag, EmptyState, LoadingState, PageHeader, SearchInput, ImageLightbox, BackLink, ConfirmDialog, ScrollToTop, HudCorners, icons.tsx
    character/        # CharacterCard, CharacterGrid, CharacterDetail, CharacterPortrait, CharacterAvatar, CharacterGallery, SkillCard, SkillShowcase, TierGroup, HighlightedText
    updates/          # UpdateCard
    intel/            # IntelCard, IntelCoverPlaceholder, IntelStatusStamp
    gameCodes/        # CodeCard
    data-table/        # FilterBar, SelectFilter, RarityFilterChips
    home/             # HeroSection (homepage); FeatureCard is reused by /calculators
    trade/            # TradeListingCard, TradeListingGrid, TradeStatusBadge — pages exist but currently unmounted, see section 5
    auth/             # LoginModal — component exists but unmounted along with AccountMenu, see section 5
  pages/
    HomePage.tsx
    CharactersPage.tsx
    CharacterDetailPage.tsx
    TierListPage.tsx
    UpdatesPage.tsx
    UpdateDetailPage.tsx
    IntelPage.tsx
    IntelDetailPage.tsx
    SeaServersPage.tsx
    GameCodesPage.tsx
    CoreLabPage.tsx
    SpecCalculatorPage.tsx
    CoreLabCalculatorPage.tsx
    TicketCalculatorPage.tsx      # real, working calculator — projects black/STK ticket totals to a target date
    CalculatorsPage.tsx
    PrivacyPolicyPage.tsx
    DisclaimerPage.tsx
    FeedbackPage.tsx
    NotFoundPage.tsx
    # Not currently routed — see "Temporarily unmounted" in section 5. Files/data models are otherwise unchanged.
    MasteryPage.tsx
    WalletPage.tsx
    TradePage.tsx
    TradeListingDetailPage.tsx
    TradeListingFormPage.tsx      # add + edit share one component (`trade/new`, `trade/:id/edit`), RequireAuth-gated
    MyTradeListingsPage.tsx        # RequireAuth-gated
    TradeDisclaimerPage.tsx
  layouts/
    AppLayout.tsx           # mounts LoginModal alongside Header/Footer/DonateWidget
  context/
    AuthContext.tsx        # AuthProvider + useAuthContext() — session, initializing, sign in/up/out (email/password only)
    LoginModalContext.tsx   # LoginModalProvider + useLoginModal() — open/close state for the global login modal
  data/
    mastery.ts             # still local mock data — see "Data Backend" in section 2
    coreLab.ts
    ticketSources.ts        # TICKET_SOURCES — the 10 fixed monthly black/STK ticket sources, consumed by TicketCalculatorPage
  lib/
    supabase.ts           # Supabase client, reads VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
    tradeListingImageStorage.ts   # uploadTradeListingImage, uploadTradeListingPaymentProof — trade-listing-images bucket
    api/
      characters.ts        # fetchCharacters, fetchCharacterBySlug + DB-row-to-Character mapper
      characterIntel.ts     # fetchCharacterIntel, fetchCharacterIntelBySlug + DB-row-to-CharacterIntelEntry mapper
      gameUpdates.ts         # fetchGameUpdates, fetchGameUpdateBySlug + DB-row-to-GameUpdateEntry mapper
      seaServers.ts           # fetchSeaServers + DB-row-to-SeaServerEntry mapper
      gameCodes.ts             # fetchGameCodes (status = 'active' only) + DB-row-to-GameCodeEntry mapper
      tradeListings.ts        # fetchApprovedTradeListings, fetchTradeListingById, fetchMyTradeListings, createTradeListing, updateTradeListing, markTradeListingSold
      releaseSchedule.ts       # fetchReleaseSchedule — orphaned, nothing on the public site calls it anymore, see "Release timing" in section 6
      # Also present: feedback.ts, masteryMaterials.ts, ticketTypeImages.ts, wallet.ts — not detailed here, see their respective feature sections above
  types/
    character.ts
    characterIntel.ts
    gameUpdate.ts
    seaServer.ts
    gameCode.ts
    tradeListing.ts
    mastery.ts
    coreLab.ts
    calculator.ts
    releaseSchedule.ts     # backs the orphaned release_schedule table only, see section 6
  utils/
    ticketCalculator.ts     # calculateProjectedTickets() — walks month-by-month from today to a target date
    gameUpdates.ts           # formatEventDateRange(), getEventStatus() — see "Game Updates" in section 6
    characterIntel.ts         # getIntelRevealLevel(), getIntelRevealImage() — see "Intel" in section 4.7
    seaServers.ts               # getSeaServerStatus(), getNextSeaServer(), getDaysUntilOpen() — see "New SEA Servers" in section 4.8
    metaTier.ts                # META_TIER_ORDER/STYLES/GLOW/CSS_VAR — see "Tier List" in section 4.1
    releaseSchedule.ts          # getNextUpcomingRelease() etc. — still real, now derived from Character debut/comeback fields, see section 6
    tradeListings.ts      # TRADE_STATUS_LABEL_KEYS/STYLES, formatTradeListingDate, TRADE_LISTING_FEE_VND
    donate.ts              # DONATE_ACCOUNT_HOLDER/NUMBER + buildVietQrUrl() — shared by DonateWidget and the trade-listing posting fee
    seo.ts                  # SITE_NAME, buildTitle(), truncateDescription(), buildBreadcrumbJsonLd()/buildWebsiteJsonLd() — see "SEO" below
    # Spec ATK/DEF and Core-Lab Resource calculators are "Coming Soon" placeholders (ComingSoonPage) — no specCalculator.ts/coreLabCalculator.ts exist yet
    # Also present: badges.ts, characters.ts, glossary.ts, mastery.ts, masteryCalculator.ts, rarity.ts, wallet.ts
  hooks/
    useCharacters.ts     # all characters from Supabase — { characters, loading, error }
    useCharacter.ts       # one character by slug from Supabase — { character, loading, error }
    useCharacterIntel.ts   # all intel dossiers from Supabase — { entries, loading, error }
    useCharacterIntelEntry.ts   # one dossier by slug from Supabase — { entry, loading, error }
    useGameUpdates.ts       # all game updates from Supabase — { updates, loading, error }
    useGameUpdate.ts         # one game update by slug from Supabase — { update, loading, error }
    useSeaServers.ts           # SEA server schedule from Supabase — { servers, loading, error }
    useGameCodes.ts             # active SEA redeem codes from Supabase — { codes, loading, error }
    useTradeListings.ts        # approved listings (optionally server-filtered) — { listings, loading, error }
    useTradeListing.ts          # one listing by id — { listing, loading, error }
    useMyTradeListings.ts        # caller's own listings — { listings, loading, error, refetch }
    useAuth.ts                    # thin re-export of context/AuthContext's hook
    useFilters.ts
    useReducedMotion.ts
    useCountUp.ts
    useReleaseSchedule.ts          # backs the orphaned release_schedule table only, see section 6
    useSeo.ts                        # per-route title/description/canonical/OG/Twitter/JSON-LD — see "SEO" below
    useTranslation.ts   # thin re-export of i18n/LanguageContext's hook
    # Also present: useMasteryMaterialImages.ts, useMyTopups.ts, usePhieuBalance.ts, useTicketTypeImages.ts
  i18n/
    locales/
      en.ts            # canonical dictionary — defines the Translations shape
      vi.ts             # typed against `Translations`; TS errors on missing/extra keys
    types.ts            # DotPaths<T> + TranslationKey (autocompletable dot-path key type)
    translate.ts         # pure lookup + {var} interpolation
    LanguageContext.tsx   # Provider: language state, localStorage persistence, sets <html lang>
    index.ts             # barrel: LanguageProvider, Language, TranslationKey
  routes/
    AppRoutes.tsx
    RequireAuth.tsx    # loading -> LoadingState; no session -> opens the login modal in place; else Outlet
  assets/
    images/
    icons/
  styles/
    index.css
public/
  characters/           # character portrait files (see Image Assets below)
  sitemap.xml, robots.txt   # generated by scripts/generate-seo-files.mjs, gitignored — see "SEO" below
scripts/
  generate-seo-files.mjs   # npm's "prebuild" hook — writes public/sitemap.xml + robots.txt from Supabase data, see "SEO" below
supabase/
  migrations/
    0001_create_characters.sql            # characters table schema + RLS policies
    0002_character_images_bucket.sql       # character-images Storage bucket + RLS
    0003_character_visibility.sql           # characters.is_visible (soft delete)
    0004_create_release_schedule.sql         # release_schedule table, FK to characters, + RLS
    0005_create_game_updates.sql              # game_updates table + RLS
    0006_update_images_bucket.sql              # update-images Storage bucket + RLS
    0007_create_admins.sql                      # admins table (zero RLS policies) + is_admin() security-definer function
    0008_tighten_content_write_policies.sql      # replaces every "Temporary open write access" policy with is_admin()-gated ones
    0009_create_trade_listings.sql                # trade_listings table, enforce_trade_listing_transitions() trigger, RLS
    0010_trade_listing_images_bucket.sql           # trade-listing-images Storage bucket + RLS
    0011_add_trade_listing_payment_fee.sql          # trade_listings.payment_proof_url — proof for the manually-collected posting fee
    0012_create_feedback.sql                         # feedback table + RLS (public insert, admin-only read/delete)
    0013_create_profiles.sql                          # profiles.phieu_balance — 1 phiếu = 1,000 VND, pays the trade-listing posting fee
    0014_create_phieu_topups.sql                       # phieu_topups table — user submits a transfer proof, admin approves to credit phieu_balance
    0015_trade_listing_phieu_fee.sql                    # replaces the old per-listing screenshot fee (0011) with a phiếu balance deduction
    0016_wallet_topup_proofs_bucket.sql                  # Storage bucket for top-up transfer screenshots
    0017_sepay_auto_topup.sql                             # SePay webhook auto-reconciliation, primary path; 0014's admin approval is now the fallback
    0018_topup_owner_attach_proof.sql                      # lets a topup row exist before the proof screenshot does, so auto-reconciliation can match it
    0019_topup_owner_cancel.sql                             # lets a user cancel their own still-pending topup
    0020_character_debut_comeback.sql                        # characters.debut_*/comeback_* — supersedes release_schedule for the homepage spotlight, see section 6
    0021_create_mastery_materials.sql                         # icon registry for Mastery materials keyed by data/mastery.ts's materialId — tiers/costs stay local TS
    0022_mastery_material_images_bucket.sql                    # Storage bucket for Mastery material icons
    0023_create_ticket_source_images.sql                        # icon registry for Ticket Calculator sources, mirrors 0021
    0024_ticket_source_images_bucket.sql                         # Storage bucket for ticket source icons
    0025_rename_ticket_type_images.sql                            # narrowed 0023 to vary by ticket type (black/STK) only, not per-source
    0026_add_character_meta_tier.sql                               # characters.meta_tier — drives /tier-list
    0027_add_topup_ticket_type.sql                                  # the floating Top Up button's icon reuses the ticket_type_images registry
    0028_create_character_intel.sql                                  # character_intel table — pre-release dossiers, see "Character Intel" in section 6
    0029_intel_images_bucket.sql                                      # Storage bucket for Intel dossier images
    0030_create_sea_new_servers.sql                                    # sea_new_servers table — SEA server launch schedule, see "New SEA Server" in section 6
    0031_create_game_codes.sql                                          # game_codes table — SEA redeem codes, see "Game Code" in section 6
    0032_drop_game_code_reward_expiry.sql                                # dropped reward/expires_at — codes just show code + a still-active/expired status now
  functions/
    analyze-update-image/
      index.ts    # Deno Edge Function — calls Anthropic vision (forced tool use) to draft a Game Update from a banner image; ANTHROPIC_API_KEY is an Edge Function secret, never client-side
  seed.sql                        # seeds the one fully-authored character (Atomic Samurai) so a fresh Supabase project isn't empty
admin/                              # separate app — own package.json/vite.config.ts/tsconfig, not built with the main site
  src/
    context/
      AuthContext.tsx               # AdminAuthState discriminated union (loading/signed-out/forbidden/authorized) — see "Authentication & Trade Listings"
    routes/
      RequireAdmin.tsx               # gates the whole AdminLayout route tree
    lib/
      supabase.ts                  # its own Supabase client instance; distinct auth.storageKey from the main site's
      characters.ts                 # fetchCharacters, fetchCharacterById, createCharacter, updateCharacter, setCharacterVisibility, setCharacterMetaTier
      characterIntel.ts              # fetchCharacterIntel, fetchCharacterIntelById, createCharacterIntel, updateCharacterIntel, deleteCharacterIntel
      gameUpdates.ts                  # fetchGameUpdates, fetchGameUpdateById, createGameUpdate, updateGameUpdate, deleteGameUpdate
      seaServers.ts                    # fetchSeaServers, fetchSeaServerById, createSeaServer, updateSeaServer, deleteSeaServer
      gameCodes.ts                      # fetchGameCodes (no status filter), fetchGameCodeById, createGameCode, updateGameCode, deleteGameCode
      tradeListings.ts                 # fetchAllTradeListings, fetchTradeListingById, approveTradeListing, rejectTradeListing
      storage.ts                       # uploadCharacterImage — character-images bucket
      updateImageStorage.ts             # uploadUpdateImage — update-images bucket
      intelImageStorage.ts               # uploads for Intel cover/hint images — intel-images bucket
      aiAnalyze.ts                       # analyzeUpdateImage — invokes the analyze-update-image Edge Function
      releaseSchedule.ts                  # fetchReleaseSchedule, createReleaseEntry, etc. — still wired up, but orphaned: SchedulePage below writes to a table nothing on the public site reads, see "Release timing" in section 6
      buttonStyles.ts                      # buttonClasses(variant, size) — the one place every primary/danger/ghost/dashed button className comes from, see "Component Guidelines" in section 8
      # Also present: dashboardStats.ts, feedback.ts, masteryMaterials.ts, masteryMaterialImageStorage.ts, ticketTypeImages.ts, ticketTypeImageStorage.ts, wallet.ts, metaTier.ts, rarity.ts, badges.ts — not detailed here
    components/
      ConfirmDialog.tsx               # useConfirm() — in-app confirmation modal for every mutating action
      Toast.tsx                        # useToast() — success/error toasts
      ImageUpload.tsx                   # character image upload (slug + slot -> character-images bucket)
      UpdateImageUpload.tsx              # update banner upload (random draft-id folder -> update-images bucket)
      IntelImageUpload.tsx                # Intel cover/hint image upload -> intel-images bucket
    pages/
      LoginPage.tsx                   # email/password only, no signup, no Google — see "Authentication & Trade Listings"
      DashboardPage.tsx               # index route — stat tiles (visible character count, pending trade listings/topups, feedback in last 7 days) + recharts charts (7-day activity line, rarity breakdown bar, trade-status pie, revenue), see "Admin Dashboard" below
      CharacterListPage.tsx          # list + edit + hide/show (no hard delete) + meta-tier assignment
      CharacterFormPage.tsx           # add + edit share one component (`characters/new`, `characters/:id/edit`)
      IntelListPage.tsx                 # list, filterable by status
      IntelFormPage.tsx                  # add + edit share one component (`intel/new`, `intel/:id/edit`)
      SeaServersPage.tsx                  # list sorted by open date, real delete
      SeaServerFormPage.tsx                # add + edit share one component (`sea-servers/new`, `sea-servers/:id/edit`)
      GameCodesPage.tsx                     # list, real delete
      GameCodeFormPage.tsx                   # add + edit share one component (`game-codes/new`, `game-codes/:id/edit`); status (active/expired) is a plain `<select>`, not derived
      UpdatesListPage.tsx                # list, filterable by category/server, real delete
      UpdateFormPage.tsx                  # add + edit share one component (`updates/new`, `updates/:id/edit`); banner upload + "Analyze with AI" pre-fill
      MasteryMaterialsPage.tsx             # icon upload per material id (routed at `mastery-materials`), see "Admin Dashboard" below
      TicketTypeImagesPage.tsx              # icon upload per ticket type — black/stk/topup (routed at `ticket-images`), see "Admin Dashboard" below
      TradeListingsPage.tsx                # list, filterable by status, quick-approve row action
      TradeListingDetailPage.tsx            # full read view incl. images; approve, or reject with a required reason
      FeedbackPage.tsx                       # read + hard delete, no edit — see "Feedback" above
      TopupsPage.tsx                          # list, filterable by status, `Auto`/`Manual` tag — see "Phiếu wallet & top-ups" above
      TopupDetailPage.tsx                      # approve or reject with a reason — see "Phiếu wallet & top-ups" above
      SchedulePage.tsx                       # orphaned — writes release_schedule rows nothing on the public site reads anymore, see "Release timing" in section 6
      ScheduleFormPage.tsx                    # same orphaned status as SchedulePage.tsx
    App.tsx
  vite.config.ts    # aliases `@main/*` to `../src/*` to reuse the main app's *type-only* Character/GameUpdateEntry/TradeListing/CharacterIntelEntry types — don't reuse React components this way (see note below)
```

This structure must stay easy to extend as more characters, calculators, and data tables are added — new local data goes into `data/`, new types into `types/`, new logic into `utils/`, new UI strings into `i18n/locales/*.ts`. Character data itself now goes into Supabase via the `admin/` app, not into `data/`.

**Cross-app reuse in `admin/`:** `admin/` and the main app are independently `npm install`ed, so they end up with separate copies of `@types/react`. Importing a `.tsx` component (or any module with a transitive `@/`-aliased import) from `../src` into `admin/` will fail to typecheck (duplicate/incompatible React types, unresolvable alias). Only cross-import dependency-free `.ts` files — in practice, just `src/types/*.ts`. Everything else (icons, constants) gets a small local copy in `admin/src/` instead of being shared.

### Internationalization (i18n)

- Two languages: English (`en`, default) and Vietnamese (`vi`). Selected language persists in `localStorage` (`opm-wiki-language`) and is applied to `<html lang>`.
- All UI chrome text (nav, buttons, labels, empty/error states, section headings) goes through `t('namespace.key')` from `useTranslation()` — never hardcode UI strings in components.
- Character **data** (names, skills, tags, type/faction/role values) stays English-only for now — it is content, not UI chrome, and is out of scope for translation until real localized game data exists.
- Adding a string: add the key to `i18n/locales/en.ts` first, then `vi.ts` — TypeScript will error if `vi.ts` is missing a key (or has one `en.ts` doesn't), since `vi` is typed against `typeof en`.
- Interpolation: values may contain `{varName}` placeholders, filled via `t(key, { varName: value })` (e.g. result counts, the footer's `{year}`).

### Image Assets

- `Character.image` (and `Skill.image` / `Passive.image` / `AwakeningTier.image` / `CoreTier.image`) is a plain string — either a relative path under `public/characters/` (legacy, hand-placed files) or a full `https://…supabase.co/storage/v1/…` URL from Supabase Storage. `<img src>` treats both identically, so no branching logic is needed to render one vs. the other.
- New characters get their images from the admin app's upload flow, not by hand-editing paths: `admin/src/components/ImageUpload.tsx` uploads to the `character-images` Supabase Storage bucket at `<slug>/<slot>.<ext>` (slots: `portrait`, `skill-1`, `skill-2`, …, `passive`, `awaken-1`, …) via `admin/src/lib/storage.ts`, then writes the resulting public URL into the form field. Bucket + RLS: `supabase/migrations/0002_character_images_bucket.sql`.
- Rendering on the site goes through `CharacterPortrait`, never a raw `<img>` in a page/feature component: it lazy-loads the image and falls back to the initials-based `CharacterAvatar` automatically on a missing file or load error — never a broken-image icon.
- Characters with no uploaded image (`image: ''`) resolve to the initials fallback, same as before.

### SEO

This is a client-only SPA (no SSR/pre-rendering, per the hard constraints in section 2), so every page's `<title>`/meta tags are set at runtime by `useSeo()` (`src/hooks/useSeo.ts`) rather than by a server render — plain DOM `meta`/`link` upserts, not a library like `react-helmet`, since there's no server-render pass to coordinate with.

- **Every page component calls `useSeo({ title, description, image?, noindex?, jsonLd? })` once**, near its own top-level `useTranslation()` call. `title` is the page-specific piece only — `useSeo` appends `· S-Class Codex` via `buildTitle()` (`src/utils/seo.ts`); omit `title` only for the homepage's own full headline-based title. Static pages reuse the same `t('<namespace>.title')`/`t('<namespace>.description')` keys their `PageHeader`/`LegalPage`/`ComingSoonPage` already render — no separate SEO-only i18n keys, to avoid two copies of the same copy drifting apart. `ComingSoonPage` and `LegalPage` call `useSeo()` internally (once, shared by both pages that render them) rather than each page duplicating the call.
- **Dynamic detail pages** (`CharacterDetailPage`, `UpdateDetailPage`, `IntelDetailPage`) build `title`/`description`/`image` from the fetched entity once loaded, `truncateDescription()`-clipped to ~160 chars on a word boundary; while loading or on a fetch error/not-found they fall back to the section's own generic title/description and set `noindex: true` (a real character/update/intel is indexable, a 404 or transient error state isn't). `CharacterDetailPage` also falls back to `t('characterDetail.seoFallbackDescription', { name, rarity, type })` when a character's own `recommendedUsage` is blank, so the meta description is never empty.
- **JSON-LD**: `useSeo`'s `jsonLd` option writes a single `<script type="application/ld+json" id="seo-jsonld">`, replaced on every route change. `buildWebsiteJsonLd()` (homepage, `WebSite`) and `buildBreadcrumbJsonLd()` (character/update/intel detail pages, `BreadcrumbList`) are the two schemas in use; add more shapes to `utils/seo.ts` the same way rather than inlining a schema object in a page.
- **`index.html`** carries the same title/description plus base `og:*`/`twitter:*` tags as a static fallback for the pre-JS paint and for crawlers that don't execute JS — `useSeo()` overwrites all of it once React mounts and a route resolves. There's no real Open Graph image asset yet (only `public/favicon.svg`, an SVG, not ideal for social cards); a proper 1200×630 raster image is still open work, tracked here rather than faked.
- **`robots.txt` + `sitemap.xml`** are generated at build time by `scripts/generate-seo-files.mjs`, wired as npm's `prebuild` hook (`package.json`) so a plain `npm run build` always regenerates them into `public/` before Vite copies `public/` into `dist/`. Static routes are a hardcoded list mirroring `AppRoutes.tsx`; dynamic routes (`/characters/:slug`, `/updates/:slug`, `/intel/:slug`) are fetched via a plain `fetch` against Supabase's PostgREST endpoint — deliberately not `@supabase/supabase-js`, since the SDK also initializes its Realtime client, which requires a native `WebSocket` global unavailable on Node <22 (a build runtime still common on Vercel/Netlify). Both generated files are gitignored (`.gitignore`) since they're always fresh at build time; a stale, placeholder-domain copy shouldn't sit in git. If Supabase env vars are missing or the fetch fails, the script logs a warning and falls back to static routes only rather than failing the build.
- **`SITE_URL` env var** (`.env.local.example`) is the site's real deployed origin, read only by `generate-seo-files.mjs` at build time (not by the app itself — per-route canonical/OG URLs are built from `window.location.origin` in the browser instead, so they're correct regardless of domain). Until a real domain/Vercel subdomain is assigned, it falls back to a clearly-labeled placeholder (`https://your-domain.vercel.app`) and the script warns on every build — set `SITE_URL` in the deploy platform's env vars once a domain exists, and the very next build's sitemap/robots.txt pick it up with no code change.

---

## 8. Component Guidelines

Key reusable components:

| Component | Purpose |
|---|---|
| `AppLayout` | Root layout wrapping header, nav, page content, footer; mounts `ScrollToTop` |
| `ScrollToTop` | Renders nothing — `useEffect` on `useLocation().pathname` to scroll the window to `(0, 0)` on every route change |
| `Header` | Compact top bar: logo, nav links, language switcher |
| `LanguageSwitcher` | Functional EN/VN pill switch — reads/writes the language via `useTranslation()` |
| `Navigation` | Main nav link list (`NAV_LINKS` from `src/routes/navigation.ts`), used in header; active route gets a pill highlight |
| `HeroSection` | The entire homepage: eyebrow, bold headline, subhead, dual CTAs, a real-data stats row (character/upcoming/rarity-tier counts), a live "current month spotlight" showcase (`getCurrentMonthSpotlightEntries()`, derived from each `Character`'s own debut/comeback fields) rendered as cards with idle `animate-float` + static 3D tilt, and a latest-rumor Intel alert strip |
| `FeatureCard` | Card linking to a tool (used on `/calculators`); hover lift + accent glow |
| `SearchInput` | Reusable search field |
| `FilterBar` | Composes one `SelectFilter` per filter group + a reset button |
| `SelectFilter` | Single labeled `<select>` filter control (one dropdown) |
| `PageHeader` | Eyebrow (optional) + large title + description block for data pages (used by `/characters`, `/intel`, `/updates`) |
| `CharacterCard` | Compact character preview (portrait, name, rarity, type/faction/role, tags, recommended usage, View Details); rarity-tinted hover glow via `--card-glow` |
| `CharacterGrid` | Grid layout of `CharacterCard` |
| `CharacterDetail` | Full character detail layout: a `comic-panel-torn` hero banner (rarity-colored `border-4`, hard offset shadow — the same signature shape as `HeroSection`'s spotlight cards and `SeaServersPage`'s Next-Launch card) with rotated rarity stamp, Role/Type/Faction/Rank tags, a glow-filled data-driven Power Tier bar (segments = `RARITY_ORDER.length - tierIndex`), staggered `animate-rise-in` section reveals, and section cards for skills/passive/awakening/strengths/weaknesses |
| `CharacterPortrait` | Renders `Character.image` (GIF/PNG/WEBP/JPG) with lazy loading; falls back to `CharacterAvatar` on missing/broken image |
| `CharacterAvatar` | Initials-on-rarity-color placeholder, used directly when there's no image and as `CharacterPortrait`'s fallback |
| `IntelCard` | Compact dossier preview for `/intel`: reveal-filtered cover image (blur/grayscale intensity from `getIntelRevealLevel()`), status badge, confidence-tagged hint count |
| `IntelCoverPlaceholder` | Fallback art shown in place of a cover/hint image on `IntelCard`/`IntelDetailPage` when neither is set |
| `IntelStatusStamp` | Rumored/Confirmed stamp-style badge for Intel dossiers |
| `ImageLightbox` | Full-size image overlay opened on click; used by `IntelDetailPage` |
| `HudCorners` | Four HUD-style corner brackets over a `relative` panel — reserved for the one hero/focal panel per page (e.g. `FeedbackPage`'s post-submit stamp) that isn't better served by `comic-panel-torn`, not every panel; see the design-register note below |
| `CodeCard` | A redeem code shown as a dashed-border "voucher stub" with a one-click copy button and a "Still active" badge; used by `/game-codes` |
| `QuickActionsWidget` | Draggable floating action button (ticket calculator + top-up); expands to a small menu, remembers its dragged vertical position |
| `Badge` | Generic label/tag pill |
| `RarityTag` | Rarity-specific colored badge |
| `EmptyState` | Shown when no data/results match |
| `LoadingState` | Shown while data is loading |

Rules:
- Components must be small, single-purpose, and reusable — not tightly coupled to one page.
- Presentational components should not contain calculation logic; that belongs in `utils/`.
- Prefer composition over deeply nested prop-drilling — use hooks (`hooks/`) for shared stateful logic (search, filters).
- Search/filter controls on data pages (`/characters`, `/intel`, `/updates`) sit inside a shared "control panel" wrapper (`rounded-2xl border border-border bg-surface p-4 shadow-xl shadow-black/20 sm:p-5`) — reuse this treatment for any new filterable page rather than inventing a new one. Inputs inside it (`SearchInput`, `SelectFilter`) use `bg-elevated`, not `bg-surface`, so they stay visible against the panel background.

---

## 9. Coding Guidelines

- Use TypeScript strictly — no `any` unless truly unavoidable, and justify it inline if so.
- All types/interfaces live in `src/types`, not inline in components.
- Never hardcode data directly inside components — all mock data lives in `src/data`.
- All calculation logic lives in `src/utils`, fully separated from UI components.
- UI components should be small and have a single clear responsibility.
- Use Tailwind CSS consistently — reuse the same spacing/color scale everywhere, avoid arbitrary one-off values.
- Use clear, descriptive file and component names (`CharacterCard.tsx`, not `Card2.tsx`).
- Favor readable, straightforward code over clever abstractions.
- Keep the gaming/wiki visual identity consistent across every page and component.
- Before adding a new feature, re-check this CLAUDE.md to stay aligned with the stack and structure.
- No comments unless the reason is genuinely non-obvious.
- No placeholder content (lorem ipsum, TODO text) visible to users — use clearly-labeled mock data instead, easy to swap for real data later.
- No hardcoded UI text in components — every user-visible string (labels, buttons, headings, empty/error states) goes through `t()` from `useTranslation()`, with the key added to both `i18n/locales/en.ts` and `vi.ts`. Character data (names, skills, tags) is exempt for now.
- Character images render only through `CharacterPortrait`, never a bare `<img src={character.image}>` — it handles the GIF/PNG/WEBP/JPG fallback chain.

---

## 10. UI/UX Requirements

- Clean header with S-Class Codex logo, active-route pill highlight in nav, and a functional EN/VN language switcher.
- Prominent search bar (global or per-section).
- Bold `HeroSection` is the entire homepage: large headline, short subhead, "Explore Characters" + "View Release Schedule" CTAs, a real-data stats row, and a live upcoming-releases showcase (CN + SEA). Other modules are reached via the header nav, not a homepage grid.
- Feature cards (on `/calculators`) linking to each tool, styled with hover lift + accent glow.
- Sidebar or tab navigation for data-heavy pages.
- `CharacterCard` shows image, name, rarity, role, tags.
- Data tables must be easy to read, with clear column headers and row separation.
- Calculator forms must be simple and mobile-friendly.
- Result panels must present output clearly (grouped by stat/resource type).
- Every data view needs loading, empty, and error states.
- Fully responsive across mobile, tablet, and desktop — mobile experience is a priority, not an afterthought.
- Touch targets minimum 44×44px on mobile.
- No horizontal scroll on any viewport.

---

## 11. Development Roadmap

### Phase 1: Project Setup & Landing Page
- Initialize React + Vite + TypeScript + Tailwind CSS.
- Build `AppLayout`, `Header`, basic `Navigation`.
- Build responsive landing page with `HeroSection` and `FeatureCard`s.

### Phase 2: Character Database
- Create character mock data (`src/data/characters.ts`).
- Build character list page: `CharacterGrid`, `SearchInput`, `FilterBar`.
- Build `CharacterDetail` page.

### Phase 3: Release Timing — superseded
- A dedicated `/release-schedule` page (month/year/server filters, grouped server sections) was never built. The underlying need — surfacing upcoming CN/SEA releases — is instead met by `Character.debutMonth`/`debutYear`/`debutTiming`/`comebackMonth`/`comebackYear`/`comebackTiming` (`supabase/migrations/0020_character_debut_comeback.sql`) feeding the homepage spotlight and Ticket Calculator's "next release" target directly — see "Release timing" in section 6.
- The original `release_schedule` table + admin Schedule pages still exist but are orphaned (see section 6) — a real, not-yet-made decision on whether to wire the public site back up to them or remove them.

### Phase 4: Calculators — Ticket Calculator done, Spec/Core-Lab still "Coming Soon" stubs
- Ticket Calculator (`/ticket-calculator`) is real and working — see `utils/ticketCalculator.ts` and its Calculator Data entry in section 6.
- Spec ATK/DEF Calculator (`/spec-calculator`) and Core-Lab Resource Calculator (`/core-lab-calculator`) currently just render `ComingSoonPage` — no `utils/specCalculator.ts`/`coreLabCalculator.ts` exist yet. Building them for real is still open work; keep all calculation logic in dedicated `utils/` files when it happens, same pattern as the Ticket Calculator.

### Phase 5: Mastery & Core-Lab Data
- Build Mastery data table.
- Build Core-Lab data table.
- Add filter/search where useful.

### Phase 6: Polish UI/UX
- Refine responsive behavior across all pages.
- Add light, purposeful animation (no layout-shift animations).
- Ensure loading/empty/error states exist everywhere data is fetched or computed.
- Basic SEO (titles, meta descriptions per route).
- Prepare for deployment (Vercel/Netlify/GitHub Pages).

---

## 12. Claude Code Working Rules

- Always read this CLAUDE.md before writing code.
- Always follow the tech stack: React + TypeScript + Vite + Tailwind CSS.
- Never use Next.js or any full-stack/SSR framework.
- Never introduce a custom backend/API server unless explicitly requested — Supabase (used directly from the browser, or via an Edge Function when a third-party API key must stay secret, as with `analyze-update-image`) is the only backend. Don't add an Express/Node layer in front of it.
- Never create unnecessary files.
- Never hardcode large data blocks directly inside components — use `src/data` for local mock data, or fetch via the relevant hook (`useCharacters`/`useCharacter`, `useReleaseSchedule`, `useGameUpdates`/`useGameUpdate`) for Supabase-backed data.
- When real data isn't available yet, use clearly-labeled, easy-to-replace mock data (for domains still local — mastery, core-lab).
- All calculation logic must be separated from UI components (`src/utils`).
- All components must be reusable and not overly coupled to a single page.
- Keep the UI modern, minimal, professional, and gaming-inspired at all times.
- After completing a part of the app, verify it runs with no TypeScript errors.
- Favor practical, clean, extensible code over unnecessary complexity.
