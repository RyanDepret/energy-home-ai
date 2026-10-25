import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';

type Page = 'home' | 'result' | 'assistant' | 'about' | 'contact' | 'credits' | 'legal' | 'privacy';

/** Métadonnées d'une page : titre, description et liens hreflang FR/EN. */
export async function pageMetadata(locale: string, page: Page, path: string): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });
  const languages = Object.fromEntries(routing.locales.map((l) => [l, `/${l}${path === '/' ? '' : path}`]));
  return {
    title: page === 'home' ? { absolute: t('home.title') } : t(`${page}.title`),
    description: t(`${page}.description`),
    alternates: { canonical: `/${locale}${path === '/' ? '' : path}`, languages: { ...languages, 'x-default': `/fr${path === '/' ? '' : path}` } },
  };
}
