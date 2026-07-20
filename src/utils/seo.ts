export const SITE_NAME = 'S-Class Codex';

export function buildTitle(pageTitle?: string): string {
  return pageTitle ? `${pageTitle} · ${SITE_NAME}` : `${SITE_NAME} — One Punch Man Character Database & Calculators`;
}

/** Truncates on a word boundary so meta descriptions don't cut off mid-word in search results. */
export function truncateDescription(text: string, maxLength = 160): string {
  if (text.length <= maxLength) return text;
  const clipped = text.slice(0, maxLength - 1);
  const lastSpace = clipped.lastIndexOf(' ');
  return `${clipped.slice(0, lastSpace > 0 ? lastSpace : maxLength - 1)}…`;
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${window.location.origin}${item.path}`,
    })),
  };
}

export function buildWebsiteJsonLd(description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: window.location.origin,
    description,
  };
}
