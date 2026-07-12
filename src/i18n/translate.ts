import type { TranslationKey, Translations } from './types';

function getByPath(source: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, segment) => {
    if (acc && typeof acc === 'object' && segment in acc) {
      return (acc as Record<string, unknown>)[segment];
    }
    return undefined;
  }, source);
}

export function translate(
  dictionary: Translations,
  key: TranslationKey,
  vars?: Record<string, string | number>
): string {
  const value = getByPath(dictionary, key);
  if (typeof value !== 'string') return key;
  if (!vars) return value;

  return value.replace(/\{(\w+)\}/g, (match, name: string) => {
    const replacement = vars[name];
    return replacement === undefined ? match : String(replacement);
  });
}
