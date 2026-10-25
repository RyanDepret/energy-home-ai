import { setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';
import { LegalPage } from '@/components/LegalPage';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return pageMetadata(locale, 'legal', '/mentions-legales');
}

export default async function LegalNoticePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalPage page="legal" updated={locale === 'fr' ? '25 octobre 2026' : '25 October 2026'} />;
}
