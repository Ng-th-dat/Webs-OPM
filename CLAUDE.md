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
| Data | Supabase (Postgres) for characters/release schedule/game updates; local TS modules for the rest | See "Data Backend" below |
| Admin | Separate Vite+React+TS app in `admin/` | Writes characters directly to Supabase; not part of the public site's build |
| Deployment target | Vercel, Netlify, or GitHub Pages | Static SPA build |

**Hard constraints:**
- React + TypeScript + Vite + Tailwind CSS only.
- No Next.js or any full-stack/SSR framework.
- No custom backend/API server — Supabase (Postgres + its auto REST API) is the only backend, used directly from the browser via `@supabase/supabase-js`. Don't add an Express/Node API layer on top of it.
- Component-based architecture, clean and easy to extend.

### Data Backend

Character data, the release schedule, and Game Updates live in Supabase, not local mock data:
- Schema/RLS: `supabase/migrations/0001_create_characters.sql`, `0004_create_release_schedule.sql`, `0005_create_game_updates.sql`. Seed data: `supabase/seed.sql`.
- Public site reads characters via `src/lib/api/characters.ts` (`fetchCharacters`, `fetchCharacterBySlug`) through `src/hooks/useCharacters.ts` / `useCharacter.ts`, the release schedule via `src/lib/api/releaseSchedule.ts` (`fetchReleaseSchedule`) through `src/hooks/useReleaseSchedule.ts`, and Game Updates via `src/lib/api/gameUpdates.ts` (`fetchGameUpdates`, `fetchGameUpdateBySlug`) through `src/hooks/useGameUpdates.ts` / `useGameUpdate.ts`. Every consumer must handle loading/error states (`LoadingState`, `EmptyState`) — Supabase is a network call, not a synchronous import.
- `release_schedule` rows reference `characters.id` by foreign key rather than duplicating name/image/rarity/etc — `fetchReleaseSchedule` joins them in at read time (`characters!inner(...)` filtered to `is_visible = true`) and flattens the join into the denormalized `ReleaseScheduleEntry` shape the components expect, so nothing needs a `buildEntry()`-style hand-sync step anymore.
- The standalone `admin/` app (own `package.json`, own Supabase client, not routed through the main site) is where characters get added/edited/hidden — `admin/src/lib/characters.ts` + `admin/src/pages/CharacterFormPage.tsx` (add + edit share one component, routed at `characters/new` and `characters/:id/edit`) / `CharacterListPage.tsx` — where the release schedule is managed — `admin/src/lib/releaseSchedule.ts` + `admin/src/pages/ScheduleFormPage.tsx` / `SchedulePage.tsx` (routed at `schedule`, `schedule/new`, `schedule/:id/edit`; unlike characters, schedule entries get a real SQL delete — they're calendar slots, not character content) — and where Game Updates are managed — `admin/src/lib/gameUpdates.ts` + `admin/src/pages/UpdateFormPage.tsx` / `UpdatesListPage.tsx` (routed at `updates`, `updates/new`, `updates/:id/edit`; also a real SQL delete — a news feed, not character content). Image uploads go through `admin/src/components/ImageUpload.tsx` + `admin/src/lib/storage.ts` into the `character-images` Storage bucket (`supabase/migrations/0002_character_images_bucket.sql`), and update banners through `admin/src/components/UpdateImageUpload.tsx` + `admin/src/lib/updateImageStorage.ts` into the `update-images` bucket (`supabase/migrations/0006_update_images_bucket.sql`) — see "Image Assets" below.
- **Character deletion is soft** — `characters.is_visible` (`supabase/migrations/0003_character_visibility.sql`, default `true`) is toggled off by the admin list's hide action (`setCharacterVisibility`) instead of ever running a SQL `delete`. The public site's `fetchCharacters`/`fetchCharacterBySlug`/`fetchReleaseSchedule` all filter to `is_visible = true`; the admin's equivalents return every row (including hidden) so they can be found and restored, typed as `AdminCharacter` (`Character & { isVisible: boolean }`) rather than widening the shared `Character` type.
- Every data-mutating action in the admin app (create/update/hide/show/delete) goes through `useConfirm()` (`admin/src/components/ConfirmDialog.tsx`) for an in-app confirmation modal before it runs, and reports success/failure via `useToast()` (`admin/src/components/Toast.tsx`) — never a bare `window.confirm`/`alert`.
- **AI-assisted Game Update drafting**: the publisher only ever sends an event banner image (no text), so the admin's Update form has an "Analyze with AI" button (`admin/src/lib/aiAnalyze.ts` → `supabase.functions.invoke('analyze-update-image', ...)`) that sends the uploaded banner's public Storage URL to the `analyze-update-image` Supabase Edge Function (`supabase/functions/analyze-update-image/index.ts`). That function calls the Anthropic Messages API server-side — image input via `{type: "image", source: {type: "url", url}}`, and forced tool use (`tool_choice` pinned to one `strict: true` tool) so the response is guaranteed-valid structured JSON (title/description/category/server/date/events) rather than free text to parse — and returns it for the admin to review/edit before publishing. **`ANTHROPIC_API_KEY` is a Supabase Edge Function secret** (`supabase secrets set ANTHROPIC_API_KEY=...`), read via `Deno.env.get(...)` inside the function; it never reaches the browser bundle. This Edge Function is the one sanctioned way to call a third-party API from this project — it's still "just Supabase," so it doesn't license adding a general-purpose Node/Express backend elsewhere.
- **Auth is wired up (Supabase Auth) for both apps.** Regular users authenticate on the main site (email/password only — Google sign-in was considered and deliberately dropped) to post Trade Listings; the admin app requires the operator to be signed in **and** listed in the `admins` table. `characters`/`release_schedule`/`game_updates` writes and the `character-images`/`update-images` bucket writes are gated by `public.is_admin()` (`supabase/migrations/0007_create_admins.sql`, `0008_tighten_content_write_policies.sql`) — no more open anon-key writes. Bootstrapping the first admin is manual: Supabase Dashboard → Authentication → Users → Add user, then `insert into public.admins (user_id) values ('<uuid>');` in the SQL editor. There is no self-service admin signup UI anywhere, by design.
- Mastery and Core-Lab are **still local TS mock data** (`src/data/*.ts`) — they have not moved to Supabase. Follow the same pattern (migration + `lib/api/*` + hook) if/when they do; don't silently mix a Supabase-backed field into an otherwise-local data file.
- Env vars: `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, set per-app in `.env.local` (see `.env.local.example` at the root and in `admin/`). Never commit real keys.

### Authentication & Trade Listings

- **Main site login is a modal, not a page** — there is no `/login` route. `src/context/AuthContext.tsx` + `src/hooks/useAuth.ts` handle `supabase.auth` (email/password only); `initializing` covers the async session-restore window (unlike `LanguageContext`, which reads `localStorage` synchronously). `src/context/LoginModalContext.tsx` (`LoginModalProvider` + `useLoginModal()`) tracks open/closed state globally; `src/components/auth/LoginModal.tsx` is mounted once in `AppLayout` and renders on top of whatever page the user is on. `src/routes/RequireAuth.tsx` opens the modal (via `useEffect`) instead of navigating away when a protected route (`/trade/new`, `/trade/:id/edit`, `/trade/mine`) is hit while signed out — the guarded route just stays put and renders once `user` becomes non-null after a successful login, no redirect-and-back-again needed. `src/components/layout/AccountMenu.tsx` (desktop popover + `AccountMenuItems` reused for `MobileDrawer`'s stacked mobile nav) opens the same modal via `useLoginModal().open()` when signed out, or shows the signed-in user's email/logout/My Listings.
- **Admin app** (`admin/src/context/AuthContext.tsx` + `admin/src/hooks/useAuth.ts`) keeps its own full-page `/login` (unrelated to the main site's modal — separate app, separate UX) and models auth as a discriminated union (`loading | signed-out | forbidden | authorized`) since being signed in and being an admin are separate checks (`supabase.rpc('is_admin')` after session resolves) — avoids representing impossible states. `admin/src/routes/RequireAdmin.tsx` gates the entire `AdminLayout` route tree; a `forbidden` account sees a plain "not an admin" page with a sign-out button rather than being redirect-looped back to `/login`. `admin/src/lib/supabase.ts` sets a distinct `auth.storageKey` (`sclass-admin-auth`) so the two apps' sessions can never collide in `localStorage` if they ever end up same-origin.
- **Trade Listings** (`trade_listings` table, `supabase/migrations/0009_create_trade_listings.sql`): a pure classifieds board for account trading — the site never handles payment **for the traded account itself** (that was explicitly considered and rejected, including disguising the account-sale payment as "donations," as deceptive to payment processors). Logged-in users submit listings (`status: 'pending'`); every listing needs admin approval (`status: 'approved'`) before it's public. RLS `insert` requires `status = 'pending'` (blocks a direct API call from self-approving), and a `before update` trigger (`enforce_trade_listing_transitions()`) — not just RLS `with check`, which can't compare old-vs-new rows — resets an edited **approved** listing back to `pending` unless the edit is a pure "mark as sold" transition, closing a moderation-bypass where someone edits an already-approved listing's content. Unlike `characters.is_visible`, this table uses a **real hard delete** (user-owned, transient rows, nothing else FKs into them). Images go in the `trade-listing-images` bucket, path `<user_id>/<listing_id>/<file>`, uploaded before the row exists via the same `draftId = crypto.randomUUID()` pattern `admin/src/pages/UpdateFormPage.tsx` uses. Public site: `src/lib/api/tradeListings.ts` + `src/hooks/useTradeListings.ts`/`useTradeListing.ts`/`useMyTradeListings.ts`, pages `TradePage`/`TradeListingDetailPage`/`TradeListingFormPage`/`MyTradeListingsPage`/`TradeDisclaimerPage`. Admin moderation: `admin/src/lib/tradeListings.ts`, pages `TradeListingsPage`/`TradeListingDetailPage` (approve, or reject with a required reason).
- **Posting fee** — this IS a real, disclosed platform fee (5 phiếu/listing, `enforce_trade_listing_fee()` in `supabase/migrations/0015_trade_listing_phieu_fee.sql`) charged for using the board itself, not for the account being traded — different in kind from the rejected "disguised donation" idea, since it's transparently labeled and doesn't touch the sale price. It's deducted atomically from the poster's `profiles.phieu_balance` at insert time (a `before insert` trigger, `for update`-locked to close a check-then-deduct race) rather than requiring a fresh bank transfer + screenshot on every single listing — that per-listing screenshot flow (`0011_add_trade_listing_payment_fee.sql`) was replaced once the phiếu wallet (below) shipped; `trade_listings.payment_proof_url` was dropped in `0015`.
- **Phiếu wallet & top-ups** (`profiles.phieu_balance`, `phieu_topups` table — `supabase/migrations/0013_create_profiles.sql`, `0014_create_phieu_topups.sql`, `0017_sepay_auto_topup.sql`): 1 phiếu = 1,000₫, used to pay the Trade Listing posting fee above. Users buy phiếu at `/wallet` (`src/pages/WalletPage.tsx` + `src/hooks/usePhieuBalance.ts`/`useMyTopups.ts` + `src/lib/api/wallet.ts`) — pick a package (`PHIEU_PACKAGES` in `src/utils/wallet.ts`), transfer via the shown VietQR (`buildVietQrUrl()`/`DONATE_ACCOUNT_HOLDER`/`DONATE_ACCOUNT_NUMBER`, `src/utils/donate.ts`, shared with `DonateWidget`) using a per-request `transfer_code` (`NAPPHIEU <8-char code>`, generated client-side and persisted on the `phieu_topups` row so it can be matched later), and submit — a payment screenshot (`wallet-topup-proofs` bucket, `uploadTopupProof` in `src/lib/walletImageStorage.ts`) is optional evidence only, not a submission gate. Two credit paths, both landing on the same `phieu_topups.status`:
  - **Auto (primary)** — SePay is linked to the site's MBBank account (`DONATE_ACCOUNT_NUMBER` in `src/utils/donate.ts`) and POSTs a webhook to `supabase/functions/sepay-webhook/index.ts` on every incoming transaction. The function normalizes the transfer content, extracts the `NAPPHIEU` code, and calls `auto_approve_phieu_topup()` (`0017`) — a `security definer` function granted **only to `service_role`** (not `authenticated`, unlike the admin RPC below), called using the Edge Function's service-role key so it bypasses RLS entirely and can never be invoked by a client session. It matches on `transfer_code` + `amount_vnd`, credits `phieu_balance`, and sets `auto_matched = true`; a `sepay_transaction_id` partial-unique index makes repeated webhook deliveries for the same transaction idempotent. Deployed with `supabase functions deploy sepay-webhook --no-verify-jwt` (server-to-server, no Supabase JWT) and gated by the `SEPAY_WEBHOOK_API_KEY` Edge Function secret — the second sanctioned third-party integration alongside `analyze-update-image`, this one inbound rather than outbound.
  - **Manual (fallback)** — a transfer the webhook can't match (wrong content/amount, or SePay not reachable) stays `pending` for an admin to resolve exactly as before: `admin/src/lib/wallet.ts` + `admin/src/pages/TopupsPage.tsx`/`TopupDetailPage.tsx`, approve via `approve_phieu_topup()` (`0014`, `is_admin()`-gated, granted to `authenticated`) or reject with a reason. The admin list defaults to filtering on `pending` so auto-matched top-ups (tagged `Auto` vs `Manual` in the UI via `auto_matched`) don't need attention unless something needed manual review.
- **Feedback** (`feedback` table, `supabase/migrations/0012_create_feedback.sql`): a public, no-login-required form at `/feedback` (`src/pages/FeedbackPage.tsx` + `src/lib/api/feedback.ts`) — message + optional contact info. RLS: `insert` is open to everyone (`with check (true)`, including anonymous visitors — feedback is deliberately zero-friction), `select`/`delete` are `is_admin()`-gated. A scrolling `MarqueeBanner` (`src/components/layout/MarqueeBanner.tsx`, mounted in `AppLayout` right below `Header`) links to `/feedback` site-wide; dismissible per session (plain component state, not persisted). Admin reviews/clears submissions at `admin/src/pages/FeedbackPage.tsx` (`admin/src/lib/feedback.ts`) — read + hard delete, no edit.

---

## 3. Design Direction

### Style
- Modern, minimal, professional, gaming-inspired — premium editorial polish, not a plain dashboard
- Dark mode first, with layered ambient background glow (soft blurred radial color blobs behind content) for depth
- Homepage is a single full-width `HeroSection` — bold headline, short subhead, dual CTAs, a real-data stats row (character count, upcoming releases, rarity tiers), and a live "upcoming on CN & SEA" showcase (2 soonest CN + 2 soonest SEA releases, pulled from `RELEASE_SCHEDULE`) with idle floating + 3D perspective tilt on the cards. No feature grid or schedule preview below it — those are reachable via the header nav instead; the homepage's whole job is a strong, self-contained first impression
- Compact density on data pages: sticky search/filter bar styled as a bordered "control panel" card, tight card padding, scan-friendly grids — favor fitting more real information over decorative whitespace on `/characters`, `/mastery`, `/core-lab`
- Rarity-aware glow: interactive cards (`CharacterCard`, `CharacterDetail` overview, `ReleaseCard`) set a `--card-glow` CSS custom property (from `RARITY_GLOW`) inline per-instance, then reference it in a static Tailwind arbitrary-value hover shadow (e.g. `hover:shadow-[0_20px_45px_-18px_var(--card-glow)]`) — gives per-rarity color without generating dynamic Tailwind classes
- Generous spacing, readable typography, fully responsive: mobile, tablet, desktop
- Community fan-site tone: confident and useful, not corporate — still professional, never cluttered

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

### 4.1 Monthly Character Release Schedule
- `/release-schedule` has month, year, and server selectors; content is grouped into a section per server (CN/SEA/Global), each showing only the servers that have entries for the selected month — a single page-level empty state covers the rest.
- Home page shows a compact preview: latest month, CN + SEA only, with a link to the full page.
- Each release card shows: portrait, character name, rarity badge, type, faction, server, release type, timing, status, and a View Character link to `/characters/:slug`.

### 4.2 All Characters Database
- Full character list (24+ characters) with real-time search (name, type, faction, role, tags) and filters (tier/rarity, type, faction, role, combinable).
- Each character has a detail page at `/characters/:slug` with a larger portrait, full kit, and strengths/weaknesses.
- Card shows portrait, name, rarity badge, type/faction/role, tags, a short recommended-usage line, and a View Details affordance.

### 4.3 Spec ATK/DEF Calculator
- User inputs current stats and upgrade parameters (level, enhancement values).
- Tool computes resulting Spec ATK/DEF.
- Simple, mobile-friendly form + clear result panel.

### 4.4 Mastery Data
- Table of Mastery levels: stat bonuses, required materials, optimization notes.
- Filterable/searchable data table.

### 4.5 Core-Lab Data
- Table/upgrade-path view of Core-Lab levels: effect, stat bonus, required materials.

### 4.6 Core-Lab Resource Calculator
- User inputs current level and target level.
- Tool computes total required resources, broken down by resource type.

---

## 5. Pages / Routes

| Route | Page | Description |
|---|---|---|
| `/` | Home | Single-section premium landing: `HeroSection` only (headline, CTAs, stats row, live upcoming CN/SEA showcase) |
| `/characters` | Character Database | Searchable/filterable list of all characters |
| `/characters/:slug` | Character Detail | Full detail view for one character |
| `/release-schedule` | Release Schedule | Month/year/server filterable release calendar, grouped by server |
| `/mastery` | Mastery | Mastery guide + Spec ATK/DEF calculator preview |
| `/core-lab` | Core-Lab | Core-Lab guide + resource calculator preview |
| `/spec-calculator` | Spec Calculator | Spec ATK/DEF calculator tool |
| `/core-lab-calculator` | Core-Lab Calculator | Core-Lab resource calculator tool |
| `/ticket-calculator` | Ticket Calculator | Projects black/STK ticket totals to a target date (next Debut/Comeback or a custom date), against the fixed monthly ticket sources in `src/data/ticketSources.ts` |
| `/calculators` | Calculators Hub | Links out to all three calculator tools |
| `/trade` | Trade Listings | Public classifieds board, approved listings only, filterable by server |
| `/trade/:id` | Trade Listing Detail | Full listing view; images, contact info, disclaimer callout, owner-only edit/mark-sold |
| `/trade/disclaimer` | Trade Disclaimer | Legal-page-pattern disclaimer — no mediation, no held funds, off-platform risk |
| `/trade/new` | New Trade Listing | **Requires login** (`RequireAuth`) — submit form, starts `pending` |
| `/trade/:id/edit` | Edit Trade Listing | **Requires login**, owner-only |
| `/trade/mine` | My Listings | **Requires login** — the caller's own listings + moderation status |

All routes are defined centrally (`src/routes/AppRoutes.tsx`) and rendered through `AppLayout`; `/trade/new`, `/trade/:id/edit`, `/trade/mine` are additionally wrapped in `<Route element={<RequireAuth/>}>` (`src/routes/RequireAuth.tsx`).

### Main navigation order
Home · Characters · Release Schedule · Trade · Mastery · Core Lab · Calculators — plus a functional EN/VN language switcher and the account menu (login, or email + My Listings + logout) — see Internationalization and Authentication & Trade Listings below.

---

## 6. Data Modeling

All types live in `src/types`. Character data lives in Supabase (see "Data Backend" in section 2); everything else's mock data lives in `src/data`. Components must never hardcode data inline.

### Character

Stored in Supabase's `characters` table (`supabase/migrations/0001_create_characters.sql`), one row per character. Nested shapes (`skills`, `passive`, `awakenings`, `core`) are JSONB columns holding the same shape as the TS interfaces below — no joins needed to render a character. DB columns are `snake_case` (`recommended_usage`, `release_version`, `release_status`); `src/lib/api/characters.ts` maps them to the camelCase `Character` shape the rest of the app uses. Never read/write the table directly from a component — go through `useCharacters`/`useCharacter` (site) or `admin/src/lib/characters.ts` (admin).

Four filterable dimensions: **rarity** (tier), **type** (combat archetype), **faction** (alignment/org), **role** (tactical role). `type`/`faction`/`role` stay plain `string` (open-ended, filter options are derived from whatever the data contains via `getUniqueSortedValues`) — only `rarity` is a closed union since it drives badge-color mapping.

```ts
interface Character {
  id: string;
  name: string;
  slug: string;
  image: string;      // path under public/characters/; .gif preferred, .png/.webp/.jpg also supported
  rarity: 'UR+' | 'UR' | 'SSR+' | 'SSR' | 'SR' | 'R' | 'N';  // highest to lowest
  type: string;      // combat archetype, e.g. Duelist, Esper, Grappler, Hi-Tech
  faction: string;   // alignment/org, e.g. Hero, Monster, Martial Artist, Outlaw, Villain, S-Class, Dragon
  role: string;      // tactical role, e.g. DPS, Tank, Support, Core, Control, Healer, Utility
  tags: string[];
  skills: Skill[];
  passive: Passive;
  awakening?: Awakening;
  strengths: string[];
  weaknesses: string[];
  recommendedUsage: string;
  releaseVersion: string;   // game version/patch the character was added in, e.g. "1.0", "1.2"
  releaseStatus: 'Upcoming' | 'Released' | 'TBD';
}

interface Skill {
  name: string;
  description: string;
}

interface Passive {
  name: string;
  description: string;
}

interface Awakening {
  name: string;
  description: string;
  requirement?: string;
}
```

### Release Schedule

Denormalized for easy rendering — `characterName`/`characterSlug`/`image`/`rarity`/`type`/`faction` live directly on the entry alongside `characterId`. To avoid hand-duplicating character data (and the drift that invites), `data/releaseSchedule.ts` never types these fields by hand: a `buildEntry()` helper looks the character up in `CHARACTERS` by id and spreads its fields in at module-load time. If you add an entry, call `buildEntry(id, month, year, server, characterId, releaseType, timing, status)` — don't write the object literal directly.

```ts
interface ReleaseScheduleEntry {
  id: string;
  month: number;        // 1-12
  year: number;
  server: 'CN' | 'SEA' | 'Global';
  characterId: string;
  characterName: string;
  characterSlug: string;
  image: string;
  rarity: Rarity;
  type: string;
  faction: string;
  releaseType: 'Debut' | 'Comeback' | 'Limited' | 'Core' | 'Event';
  timing: 'Start of Month' | 'Mid Month' | 'End of Month';
  status: 'Upcoming' | 'Released' | 'TBD';
}
```

### Game Updates

Stored in Supabase's `game_updates` table (`supabase/migrations/0005_create_game_updates.sql`), one row per post. `events` is a JSONB column holding `UpdateSubEvent[]` directly — no join needed. `server` is nullable for posts that aren't server-specific (e.g. general patch notes); `type`/`server` map straight to the columns, no `buildEntry()`-style helper needed since there's no character FK to join.

```ts
type UpdateCategory = 'Update' | 'Event' | 'CnNews' | 'Maintenance';

interface UpdateSubEvent {
  dateRange: string;
  title: string;
  note?: string;
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

---

## 7. Project Structure

```
src/
  components/
    layout/          # AppLayout, Header, Navigation, Footer, LanguageSwitcher
    common/           # Badge, RarityTag, StatCard, EmptyState, LoadingState, PageHeader
    character/        # CharacterCard, CharacterGrid, CharacterTable, CharacterDetail, CharacterPortrait, CharacterAvatar
    release-schedule/ # ReleaseCard, ReleaseGrid, ServerSection, MonthSelector
    calculator/        # CalculatorForm, ResultPanel
    data-table/        # DataTable, FilterBar, SelectFilter
    home/             # HeroSection (homepage); FeatureCard is reused by /calculators
    trade/            # TradeListingCard, TradeListingGrid, TradeStatusBadge
    auth/             # LoginModal — mounted once in AppLayout, opened via useLoginModal()
  pages/
    HomePage.tsx
    CharactersPage.tsx
    CharacterDetailPage.tsx
    ReleaseSchedulePage.tsx
    UpdatesPage.tsx
    UpdateDetailPage.tsx
    MasteryPage.tsx
    CoreLabPage.tsx
    SpecCalculatorPage.tsx
    CoreLabCalculatorPage.tsx
    TicketCalculatorPage.tsx      # real, working calculator — projects black/STK ticket totals to a target date
    CalculatorsPage.tsx
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
      releaseSchedule.ts    # fetchReleaseSchedule — joins characters!inner, flattens into ReleaseScheduleEntry
      gameUpdates.ts         # fetchGameUpdates, fetchGameUpdateBySlug + DB-row-to-GameUpdateEntry mapper
      tradeListings.ts        # fetchApprovedTradeListings, fetchTradeListingById, fetchMyTradeListings, createTradeListing, updateTradeListing, markTradeListingSold
  types/
    character.ts
    releaseSchedule.ts
    gameUpdate.ts
    tradeListing.ts
    mastery.ts
    coreLab.ts
    calculator.ts
  utils/
    specCalculator.ts
    coreLabCalculator.ts
    ticketCalculator.ts     # calculateProjectedTickets() — walks month-by-month from today to a target date
    filters.ts
    format.ts
    tradeListings.ts      # TRADE_STATUS_LABEL_KEYS/STYLES, formatTradeListingDate, TRADE_LISTING_FEE_VND
    donate.ts              # DONATE_ACCOUNT_HOLDER/NUMBER + buildVietQrUrl() — shared by DonateWidget and the trade-listing posting fee
  hooks/
    useCharacters.ts     # all characters from Supabase — { characters, loading, error }
    useCharacter.ts       # one character by slug from Supabase — { character, loading, error }
    useReleaseSchedule.ts  # release schedule from Supabase — { entries, loading, error }
    useGameUpdates.ts       # all game updates from Supabase — { updates, loading, error }
    useGameUpdate.ts         # one game update by slug from Supabase — { update, loading, error }
    useTradeListings.ts        # approved listings (optionally server-filtered) — { listings, loading, error }
    useTradeListing.ts          # one listing by id — { listing, loading, error }
    useMyTradeListings.ts        # caller's own listings — { listings, loading, error, refetch }
    useAuth.ts                    # thin re-export of context/AuthContext's hook
    useSearch.ts
    useFilter.ts
    useTranslation.ts   # thin re-export of i18n/LanguageContext's hook
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
  functions/
    analyze-update-image/
      index.ts    # Deno Edge Function — calls Anthropic vision (forced tool use) to draft a Game Update from a banner image; ANTHROPIC_API_KEY is an Edge Function secret, never client-side
  seed.sql                        # seeds the Atomic Samurai row + its July 2026 release schedule entries
admin/                              # separate app — own package.json/vite.config.ts/tsconfig, not built with the main site
  src/
    context/
      AuthContext.tsx               # AdminAuthState discriminated union (loading/signed-out/forbidden/authorized) — see "Authentication & Trade Listings"
    routes/
      RequireAdmin.tsx               # gates the whole AdminLayout route tree
    lib/
      supabase.ts                  # its own Supabase client instance; distinct auth.storageKey from the main site's
      characters.ts                 # fetchCharacters, fetchCharacterById, createCharacter, updateCharacter, setCharacterVisibility
      releaseSchedule.ts             # fetchReleaseSchedule, fetchReleaseEntryById, createReleaseEntry, updateReleaseEntry, deleteReleaseEntry
      gameUpdates.ts                  # fetchGameUpdates, fetchGameUpdateById, createGameUpdate, updateGameUpdate, deleteGameUpdate
      tradeListings.ts                 # fetchAllTradeListings, fetchTradeListingById, approveTradeListing, rejectTradeListing
      storage.ts                       # uploadCharacterImage — character-images bucket
      updateImageStorage.ts             # uploadUpdateImage — update-images bucket
      aiAnalyze.ts                       # analyzeUpdateImage — invokes the analyze-update-image Edge Function
    components/
      ConfirmDialog.tsx               # useConfirm() — in-app confirmation modal for every mutating action
      Toast.tsx                        # useToast() — success/error toasts
      ImageUpload.tsx                   # character image upload (slug + slot -> character-images bucket)
      UpdateImageUpload.tsx              # update banner upload (random draft-id folder -> update-images bucket)
    pages/
      LoginPage.tsx                   # email/password only, no signup, no Google — see "Authentication & Trade Listings"
      CharacterListPage.tsx          # list + edit + hide/show (no hard delete)
      CharacterFormPage.tsx           # add + edit share one component (`characters/new`, `characters/:id/edit`)
      SchedulePage.tsx                 # list, grouped by month/year, with a CN/SEA 2-per-month completeness check
      ScheduleFormPage.tsx              # add + edit share one component (`schedule/new`, `schedule/:id/edit`)
      UpdatesListPage.tsx                # list, filterable by category/server, real delete
      UpdateFormPage.tsx                  # add + edit share one component (`updates/new`, `updates/:id/edit`); banner upload + "Analyze with AI" pre-fill
      TradeListingsPage.tsx                # list, filterable by status, quick-approve row action
      TradeListingDetailPage.tsx            # full read view incl. images; approve, or reject with a required reason
    App.tsx
  vite.config.ts    # aliases `@main/*` to `../src/*` to reuse the main app's *type-only* Character/ReleaseScheduleEntry/GameUpdateEntry/TradeListing types — don't reuse React components this way (see note below)
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

---

## 8. Component Guidelines

Key reusable components:

| Component | Purpose |
|---|---|
| `AppLayout` | Root layout wrapping header, nav, page content, footer; mounts `ScrollToTop` |
| `ScrollToTop` | Renders nothing — `useEffect` on `useLocation().pathname` to scroll the window to `(0, 0)` on every route change |
| `Header` | Compact top bar: logo, nav links, language switcher |
| `LanguageSwitcher` | Functional EN/VN pill switch — reads/writes the language via `useTranslation()` |
| `Sidebar` | Secondary nav for data-heavy pages (characters, mastery, core-lab) |
| `Navigation` | Main nav link list, used in header and/or sidebar; active route gets a pill highlight |
| `HeroSection` | The entire homepage: eyebrow, bold headline, subhead, dual CTAs, a real-data stats row (character/upcoming/rarity-tier counts), and a live "upcoming on CN & SEA" showcase — 2 soonest CN + 2 soonest SEA entries from `RELEASE_SCHEDULE` (via `getUpcomingEntriesForServer`), rendered as cards with idle `animate-float` + static 3D `perspective`/`rotate-x`/`rotate-y` tilt that flattens and lifts on hover |
| `FeatureCard` | Card linking to a tool (used on `/calculators`); hover lift + accent glow |
| `ReleaseCard` | Compact release card: server/type badges, status, portrait, rarity/type/faction, timing, view-character link; rarity-tinted hover glow via `--card-glow` |
| `ReleaseGrid` | Grid layout of `ReleaseCard` |
| `ServerSection` | One server's header (code + label + month) + its `ReleaseGrid` |
| `MonthSelector` | Translated month `<select>` (delegates rendering to `SelectFilter`) |
| `SearchInput` | Reusable search field |
| `FilterBar` | Composes one `SelectFilter` per filter group + a reset button |
| `SelectFilter` | Single labeled `<select>` filter control (one dropdown) |
| `PageHeader` | Eyebrow (optional) + large title + description block for data pages (used by `/characters`, `/release-schedule`) |
| `CharacterCard` | Compact character preview (portrait, name, rarity, type/faction/role, tags, recommended usage, View Details); rarity-tinted hover glow via `--card-glow` |
| `CharacterGrid` | Grid layout of `CharacterCard` |
| `CharacterTable` | Tabular character list view |
| `CharacterDetail` | Full character detail layout: glow-bordered overview card wrapped in corner HUD brackets, `HudFrame` rings behind the portrait, Role/Type/Faction stat tags, a data-driven Power Tier bar (segments = `RARITY_ORDER.length - tierIndex`), section cards for skills/passive/awakening/strengths/weaknesses |
| `HudFrame` | Decorative SVG rings behind `CharacterDetail`'s portrait — concentric circles with `animate-spin-slow`/`animate-spin-slow-reverse`, colored via `RARITY_STYLES` + `currentColor` |
| `CharacterPortrait` | Renders `Character.image` (GIF/PNG/WEBP/JPG) with lazy loading; falls back to `CharacterAvatar` on missing/broken image |
| `CharacterAvatar` | Initials-on-rarity-color placeholder, used directly when there's no image and as `CharacterPortrait`'s fallback |
| `DataTable` | Generic sortable/filterable table for Mastery/Core-Lab data |
| `CalculatorForm` | Generic input form for calculator tools |
| `ResultPanel` | Displays calculator output clearly |
| `StatCard` | Small stat display block |
| `Badge` | Generic label/tag pill |
| `RarityTag` | Rarity-specific colored badge |
| `EmptyState` | Shown when no data/results match |
| `LoadingState` | Shown while data is loading |

Rules:
- Components must be small, single-purpose, and reusable — not tightly coupled to one page.
- Presentational components should not contain calculation logic; that belongs in `utils/`.
- Prefer composition over deeply nested prop-drilling — use hooks (`hooks/`) for shared stateful logic (search, filters).
- Search/filter controls on data pages (`/characters`, `/release-schedule`) sit inside a shared "control panel" wrapper (`rounded-2xl border border-border bg-surface p-4 shadow-xl shadow-black/20 sm:p-5`) — reuse this treatment for any new filterable page rather than inventing a new one. Inputs inside it (`SearchInput`, `SelectFilter`) use `bg-elevated`, not `bg-surface`, so they stay visible against the panel background.

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
- Build character list page: `CharacterGrid`/`CharacterTable`, `SearchInput`, `FilterBar`.
- Build `CharacterDetail` page.

### Phase 3: Release Schedule — done
- Release schedule mock data spans multiple months/years/servers, all 5 release types.
- `/release-schedule` built with month/year/server filters, grouped server sections, empty state.
- Each entry links to its character's detail page.

### Phase 4: Calculators
- Build Spec ATK/DEF Calculator (`CalculatorForm` + `ResultPanel`).
- Build Core-Lab Resource Calculator.
- Keep all calculation logic in `utils/specCalculator.ts` and `utils/coreLabCalculator.ts`.

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
