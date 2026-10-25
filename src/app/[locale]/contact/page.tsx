import { getTranslations, setRequestLocale } from 'next-intl/server';
import { rich } from '@/lib/rich';
import { pageMetadata } from '@/lib/seo';
import { SITE } from '@/lib/site';
import { ContactForm } from '@/components/ContactForm';
import { Footer } from '@/components/Footer';
import { PhotoBand } from '@/components/PhotoBand';
import { Reveal } from '@/components/Reveal';
import { ArrowUpRight } from '@/components/Icons';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return pageMetadata(locale, 'contact', '/contact');
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('contact');
  const cases = t.raw('cases') as { k: string; t: string; d: string }[];

  return (
    <>
      <main id="main">
        <PhotoBand src="/images/bureau.jpg" position="center 55%" kick={t('kick')} title={t.rich('title', rich)} lead={t('lead')} />
        <section className="sec">
          <div className="wrap two-col">
            <div>
              <p className="kick">{t('directKick')}</p>
              <a href={`mailto:${SITE.email}`} className="lk lk-u" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginTop: 28, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(22px, 2.8vw, 38px)', letterSpacing: '-0.025em', wordBreak: 'break-all' }}>
                {SITE.email} <ArrowUpRight size={22} />
              </a>
              <p className="small" style={{ marginTop: 24, fontSize: 15 }}>{t('where')}</p>
              <div className="grid-2" style={{ marginTop: 48 }}>
                {cases.map((c, k) => (
                  <Reveal key={c.k} delay={k * 0.08} className="card">
                    <div style={{ padding: 28 }}>
                      <p className="kick muted" style={{ fontSize: 11 }}>{c.k}</p>
                      <p className="h3" style={{ marginTop: 14, fontSize: 24 }}>{c.t}</p>
                      <p className="small" style={{ marginTop: 10 }}>{c.d}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
            <Reveal delay={0.1}><ContactForm /></Reveal>
          </div>
        </section>
      </main>
      <Footer variant="contact" />
    </>
  );
}
