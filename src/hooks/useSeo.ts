import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { buildTitle, SITE_NAME } from '@/utils/seo';

interface UseSeoOptions {
  /** Page-specific title, e.g. "Characters". Omit for the homepage's own full title. */
  title?: string;
  description: string;
  image?: string;
  noindex?: boolean;
  jsonLd?: object | object[];
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

const JSON_LD_ID = 'seo-jsonld';

/** Sets document.title, meta description/OG/Twitter tags, canonical link, and optional JSON-LD
    structured data for the current route. Plain DOM upserts rather than a library — this is a
    client-only SPA (no SSR), so there's no server-render pass to coordinate with. */
export function useSeo({ title, description, image, noindex, jsonLd }: UseSeoOptions) {
  const location = useLocation();

  useEffect(() => {
    document.title = buildTitle(title);

    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    const canonicalUrl = `${window.location.origin}${location.pathname}`;
    upsertLink('canonical', canonicalUrl);

    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:title', buildTitle(title));
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', buildTitle(title));
    upsertMeta('name', 'twitter:description', description);

    if (image) {
      const absoluteImage = image.startsWith('http') ? image : `${window.location.origin}${image}`;
      upsertMeta('property', 'og:image', absoluteImage);
      upsertMeta('name', 'twitter:image', absoluteImage);
    }

    const existingJsonLd = document.getElementById(JSON_LD_ID);
    if (jsonLd) {
      const script = existingJsonLd ?? document.createElement('script');
      script.id = JSON_LD_ID;
      (script as HTMLScriptElement).type = 'application/ld+json';
      script.textContent = JSON.stringify(jsonLd);
      if (!existingJsonLd) document.head.appendChild(script);
    } else if (existingJsonLd) {
      existingJsonLd.remove();
    }
  }, [title, description, image, noindex, jsonLd, location.pathname]);
}
