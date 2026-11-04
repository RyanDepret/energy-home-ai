import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { fontVariables } from '@/fonts';
import { SITE } from '@/lib/site';
import { Header } from '@/components/Header';
import { SmoothScroll } from '@/components/SmoothScroll';
import '../globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = { themeColor: '#0b1712', colorScheme: 'dark' };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();
  return {
    metadataBase: new URL(SITE.url),
    title: { default: t('home.title'), template: `%s · ${t('siteName')}` },
    description: t('home.description'),
    applicationName: t('siteName'),
    authors: [{ name: SITE.author }],
    openGraph: { type: 'website', siteName: t('siteName'), locale: locale === 'fr' ? 'fr_FR' : 'en_GB' },
    twitter: { card: 'summary_large_image' },
    ...(googleVerification ? { verification: { google: googleVerification } } : {}),
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} className={fontVariables} suppressHydrationWarning>
      <head>
        {/* Active les animations d'apparition uniquement si JavaScript tourne. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <NextIntlClientProvider>
          <SmoothScroll />
          <Header />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
