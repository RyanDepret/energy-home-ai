import { setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';
import { LegalPage } from '@/components/LegalPage';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return pageMetadata(locale, 'privacy', '/confidentialite');
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalPage page="privacy" updated={locale === 'fr' ? '25 octobre 2026' : '25 October 2026'} />;
}
