import type { TranslationKey } from '@/i18n';

export interface NavLink {
  labelKey: TranslationKey;
  path: string;
}

export const NAV_LINKS: NavLink[] = [
  { labelKey: 'common.home', path: '/' },
  { labelKey: 'common.characters', path: '/characters' },
  { labelKey: 'common.tierList', path: '/tier-list' },
  { labelKey: 'common.updates', path: '/updates' },
  { labelKey: 'common.intel', path: '/intel' },
  { labelKey: 'common.ticketCalculator', path: '/ticket-calculator' },
];
