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
- **No auth is wired up yet** — the `characters`/`release_schedule`/`game_updates` tables' RLS write policies, and the `character-images`/`update-images` buckets' write policies, are all temporarily open to anyone with the anon key (see each migration's comment). Tighten before real users can find the admin app's URL.
- Mastery and Core-Lab are **still local TS mock data** (`src/data/*.ts`) — they have not moved to Supabase. Follow the same pattern (migration + `lib/api/*` + hook) if/when they do; don't silently mix a Supabase-backed field into an otherwise-local data file.
- Env vars: `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, set per-app in `.env.local` (see `.env.local.example` at the root and in `admin/`). Never commit real keys.

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
| `/calculators` | Calculators Hub | Links out to both calculator tools |

All routes are defined centrally (e.g. `src/routes`) and rendered through `AppLayout`.

### Main navigation order
Home · Characters · Release Schedule · Mastery · Core Lab · Calculators — plus a functional EN/VN language switcher (see Internationalization below).

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
  pages/
    HomePage.tsx
    CharactersPage.tsx
    CharacterDetailPage.tsx
    ReleaseSchedulePage.tsx
    MasteryPage.tsx
    CoreLabPage.tsx
    SpecCalculatorPage.tsx
    CoreLabCalculatorPage.tsx
    CalculatorsPage.tsx
  layouts/
    AppLayout.tsx
  data/
    mastery.ts             # still local mock data — see "Data Backend" in section 2
    coreLab.ts
  lib/
    supabase.ts           # Supabase client, reads VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
    api/
      characters.ts        # fetchCharacters, fetchCharacterBySlug + DB-row-to-Character mapper
      releaseSchedule.ts    # fetchReleaseSchedule — joins characters!inner, flattens into ReleaseScheduleEntry
      gameUpdates.ts         # fetchGameUpdates, fetchGameUpdateBySlug + DB-row-to-GameUpdateEntry mapper
  types/
    character.ts
    releaseSchedule.ts
    gameUpdate.ts
    mastery.ts
    coreLab.ts
    calculator.ts
  utils/
    specCalculator.ts
    coreLabCalculator.ts
    filters.ts
    format.ts
  hooks/
    useCharacters.ts     # all characters from Supabase — { characters, loading, error }
    useCharacter.ts       # one character by slug from Supabase — { character, loading, error }
    useReleaseSchedule.ts  # release schedule from Supabase — { entries, loading, error }
    useGameUpdates.ts       # all game updates from Supabase — { updates, loading, error }
    useGameUpdate.ts         # one game update by slug from Supabase — { update, loading, error }
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
  functions/
    analyze-update-image/
      index.ts    # Deno Edge Function — calls Anthropic vision (forced tool use) to draft a Game Update from a banner image; ANTHROPIC_API_KEY is an Edge Function secret, never client-side
  seed.sql                        # seeds the Atomic Samurai row + its July 2026 release schedule entries
admin/                              # separate app — own package.json/vite.config.ts/tsconfig, not built with the main site
  src/
    lib/
      supabase.ts                  # its own Supabase client instance
      characters.ts                 # fetchCharacters, fetchCharacterById, createCharacter, updateCharacter, setCharacterVisibility
      releaseSchedule.ts             # fetchReleaseSchedule, fetchReleaseEntryById, createReleaseEntry, updateReleaseEntry, deleteReleaseEntry
      gameUpdates.ts                  # fetchGameUpdates, fetchGameUpdateById, createGameUpdate, updateGameUpdate, deleteGameUpdate
      storage.ts                       # uploadCharacterImage — character-images bucket
      updateImageStorage.ts             # uploadUpdateImage — update-images bucket
      aiAnalyze.ts                       # analyzeUpdateImage — invokes the analyze-update-image Edge Function
    components/
      ConfirmDialog.tsx               # useConfirm() — in-app confirmation modal for every mutating action
      Toast.tsx                        # useToast() — success/error toasts
      ImageUpload.tsx                   # character image upload (slug + slot -> character-images bucket)
      UpdateImageUpload.tsx              # update banner upload (random draft-id folder -> update-images bucket)
    pages/
      CharacterListPage.tsx          # list + edit + hide/show (no hard delete)
      CharacterFormPage.tsx           # add + edit share one component (`characters/new`, `characters/:id/edit`)
      SchedulePage.tsx                 # list, grouped by month/year, with a CN/SEA 2-per-month completeness check
      ScheduleFormPage.tsx              # add + edit share one component (`schedule/new`, `schedule/:id/edit`)
      UpdatesListPage.tsx                # list, filterable by category/server, real delete
      UpdateFormPage.tsx                  # add + edit share one component (`updates/new`, `updates/:id/edit`); banner upload + "Analyze with AI" pre-fill
    App.tsx
  vite.config.ts    # aliases `@main/*` to `../src/*` to reuse the main app's *type-only* Character/ReleaseScheduleEntry/GameUpdateEntry types — don't reuse React components this way (see note below)
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
