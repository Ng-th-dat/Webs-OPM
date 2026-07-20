import type { TranslationKey } from '@/i18n';

export interface NavLink {
  labelKey: TranslationKey;
  path: string;
}

/** Full flat list of every top-level page — the source of truth for the footer's "Explore"
    column and the mobile drawer, both of which have room to just list everything. */
export const NAV_LINKS: NavLink[] = [
  { labelKey: 'common.home', path: '/' },
  { labelKey: 'common.characters', path: '/characters' },
  { labelKey: 'common.tierList', path: '/tier-list' },
  { labelKey: 'common.updates', path: '/updates' },
  { labelKey: 'common.intel', path: '/intel' },
  { labelKey: 'common.seaServers', path: '/sea-servers' },
  { labelKey: 'common.gameCodes', path: '/game-codes' },
  { labelKey: 'common.ticketCalculator', path: '/ticket-calculator' },
];

export interface NavGroup {
  labelKey: TranslationKey;
  links: NavLink[];
}

export type HeaderNavEntry = { link: NavLink; group?: undefined } | { link?: undefined; group: NavGroup };

/**
 * The desktop header row groups "what's happening right now" content (patch notes, rumors,
 * new servers) under one "News" dropdown — same pages as NAV_LINKS, just organized to fit a
 * single row without every Vietnamese label wrapping onto two lines. Keep this in sync with
 * NAV_LINKS when a page is added/removed.
 */
export const HEADER_NAV_ENTRIES: HeaderNavEntry[] = [
  { link: { labelKey: 'common.home', path: '/' } },
  { link: { labelKey: 'common.characters', path: '/characters' } },
  { link: { labelKey: 'common.tierList', path: '/tier-list' } },
  {
    group: {
      labelKey: 'common.newsGroup',
      links: [
        { labelKey: 'common.updates', path: '/updates' },
        { labelKey: 'common.intel', path: '/intel' },
        { labelKey: 'common.seaServers', path: '/sea-servers' },
        { labelKey: 'common.gameCodes', path: '/game-codes' },
      ],
    },
  },
  { link: { labelKey: 'common.ticketCalculator', path: '/ticket-calculator' } },
];
