import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { SITE } from '@/lib/site';

const PATHS = ['', '/simulateur', '/assistant', '/a-propos', '/contact', '/credits', '/mentions-legales', '/confidentialite'];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map((path) => ({
    url: `${SITE.url}/${routing.defaultLocale}${path}`,
    changeFrequency: 'monthly',
    priority: path === '' ? 1 : path === '/simulateur' ? 0.9 : 0.6,
    alternates: { languages: Object.fromEntries(routing.locales.map((l) => [l, `${SITE.url}/${l}${path}`])) },
  }));
}
