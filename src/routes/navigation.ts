import type { TranslationKey } from '@/i18n';

export interface NavLink {
  labelKey: TranslationKey;
  path: string;
}

export const NAV_LINKS: NavLink[] = [
  { labelKey: 'common.home', path: '/' },
  { labelKey: 'common.characters', path: '/characters' },
  { labelKey: 'common.updates', path: '/updates' },
];
