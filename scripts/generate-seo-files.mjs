#!/usr/bin/env node
// Runs as the "prebuild" npm hook (see package.json) so `npm run build` always ships a fresh
// sitemap.xml/robots.txt in dist/ — static routes are hardcoded below, dynamic ones (character,
// update, and intel slugs) are pulled from Supabase at build time.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const rootDir = path.resolve(fileURLToPath(import.meta.url), '../..');

// Hosted platforms (Vercel/Netlify) inject env vars into process.env directly for the build
// command; .env.local only needs manual loading for local `npm run build` runs.
function loadDotEnvLocal() {
  const envPath = path.join(rootDir, '.env.local');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed
      .slice(eq + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '');
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadDotEnvLocal();

const PLACEHOLDER_SITE_URL = 'https://your-domain.vercel.app';
const SITE_URL = (process.env.SITE_URL || PLACEHOLDER_SITE_URL).replace(/\/$/, '');
if (!process.env.SITE_URL) {
  console.warn(
    `[generate-seo-files] SITE_URL is not set — sitemap.xml/robots.txt will use the placeholder "${SITE_URL}". ` +
      'Set the SITE_URL env var to the real deployed domain once one exists, and rebuild.'
  );
}

// Mirrors the public routes in src/routes/AppRoutes.tsx. Excludes the catch-all 404 route and
// the trade/wallet/mastery routes, which are currently unmounted (see CLAUDE.md section 5).
const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/characters', priority: '0.9', changefreq: 'daily' },
  { path: '/tier-list', priority: '0.8', changefreq: 'weekly' },
  { path: '/updates', priority: '0.8', changefreq: 'daily' },
  { path: '/intel', priority: '0.7', changefreq: 'daily' },
  { path: '/sea-servers', priority: '0.6', changefreq: 'daily' },
  { path: '/game-codes', priority: '0.7', changefreq: 'daily' },
  { path: '/core-lab', priority: '0.5', changefreq: 'monthly' },
  { path: '/calculators', priority: '0.6', changefreq: 'monthly' },
  { path: '/spec-calculator', priority: '0.3', changefreq: 'monthly' },
  { path: '/core-lab-calculator', priority: '0.3', changefreq: 'monthly' },
  { path: '/ticket-calculator', priority: '0.6', changefreq: 'monthly' },
  { path: '/privacy-policy', priority: '0.2', changefreq: 'yearly' },
  { path: '/disclaimer', priority: '0.2', changefreq: 'yearly' },
  { path: '/feedback', priority: '0.3', changefreq: 'monthly' },
];

// Plain PostgREST fetch rather than @supabase/supabase-js — the SDK also pulls in the Realtime
// client, which requires a native WebSocket global that isn't available on Node <22 (a common
// build runtime on Vercel/Netlify today). This script only ever does anonymous reads, so raw
// `fetch` avoids that dependency entirely.
async function fetchTable(supabaseUrl, supabaseKey, table, select, filter = '') {
  const url = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/${table}?select=${encodeURIComponent(select)}${filter}`;
  const res = await fetch(url, {
    headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
  });
  if (!res.ok) throw new Error(`${table} fetch failed: ${res.status} ${res.statusText}`);
  return res.json();
}

async function fetchDynamicRoutes() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.warn(
      '[generate-seo-files] VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY not set — sitemap.xml will only include static routes.'
    );
    return [];
  }

  try {
    const [characters, updates, intel] = await Promise.all([
      fetchTable(supabaseUrl, supabaseKey, 'characters', 'slug,updated_at', '&is_visible=eq.true'),
      fetchTable(supabaseUrl, supabaseKey, 'game_updates', 'slug'),
      fetchTable(supabaseUrl, supabaseKey, 'character_intel', 'slug,updated_at'),
    ]);

    const routes = [];
    for (const row of characters) {
      routes.push({ path: `/characters/${row.slug}`, priority: '0.7', changefreq: 'weekly', lastmod: row.updated_at });
    }
    for (const row of updates) {
      routes.push({ path: `/updates/${row.slug}`, priority: '0.5', changefreq: 'monthly' });
    }
    for (const row of intel) {
      routes.push({ path: `/intel/${row.slug}`, priority: '0.5', changefreq: 'weekly', lastmod: row.updated_at });
    }
    return routes;
  } catch (err) {
    console.warn(
      '[generate-seo-files] Failed to fetch dynamic routes from Supabase, continuing with static routes only:',
      err instanceof Error ? err.message : err
    );
    return [];
  }
}

function buildSitemapXml(routes) {
  const urls = routes
    .map((route) => {
      const loc = `${SITE_URL}${route.path}`;
      const lastmod = route.lastmod ? `\n    <lastmod>${new Date(route.lastmod).toISOString().slice(0, 10)}</lastmod>` : '';
      return `  <url>\n    <loc>${loc}</loc>${lastmod}\n    <changefreq>${route.changefreq}</changefreq>\n    <priority>${route.priority}</priority>\n  </url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function buildRobotsTxt() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
}

const dynamicRoutes = await fetchDynamicRoutes();
const allRoutes = [...STATIC_ROUTES, ...dynamicRoutes];

writeFileSync(path.join(rootDir, 'public', 'sitemap.xml'), buildSitemapXml(allRoutes));
writeFileSync(path.join(rootDir, 'public', 'robots.txt'), buildRobotsTxt());

console.log(`[generate-seo-files] Wrote sitemap.xml with ${allRoutes.length} URLs and robots.txt (SITE_URL=${SITE_URL}).`);
