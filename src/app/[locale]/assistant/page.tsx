import { getTranslations, setRequestLocale } from 'next-intl/server';
import { fromSearchParams } from '@/lib/logement';
import { rich } from '@/lib/rich';
import { pageMetadata } from '@/lib/seo';
import { Footer } from '@/components/Footer';
import { PhotoBand } from '@/components/PhotoBand';
import { Chat } from '@/components/assistant/Chat';

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return pageMetadata(locale, 'assistant', '/assistant');
}

export default async function AssistantPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('assistant');
  const sp = await searchParams;
  const usp = new URLSearchParams(Object.entries(sp).flatMap(([k, v]) => (typeof v === 'string' ? [[k, v]] : [])));
  const logement = fromSearchParams(usp);
  const q = usp.get('q')?.slice(0, 500) ?? undefined;

  return (
    <>
      <main id="main">
        <PhotoBand src="/images/salon.jpg" kick={t('kick')} title={t.rich('title', rich)} lead={t('lead')} />
        <section className="sec" style={{ paddingTop: 'clamp(48px, 6vw, 80px)' }}>
          <div className="wrap">
            <Chat logement={logement} initialQuestion={q} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
