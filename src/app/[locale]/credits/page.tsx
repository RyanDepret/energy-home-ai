import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { rich } from '@/lib/rich';
import { pageMetadata } from '@/lib/seo';
import { Footer } from '@/components/Footer';
import { PhotoBand } from '@/components/PhotoBand';
import { Reveal } from '@/components/Reveal';
import { ArrowUpRight } from '@/components/Icons';

type Props = { params: Promise<{ locale: string }> };
type Row = [string, string, string, string, string];

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return pageMetadata(locale, 'credits', '/credits');
}

export default async function CreditsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('credits');
  const images = t.raw('images') as [string, string, string, string][];
  const groups = t.raw('groups') as { name: string; rows: Row[] }[];
  const cols = t.raw('cols') as string[];

  return (
    <>
      <main id="main">
        <PhotoBand src="/images/maison-pierre-crepuscule.jpg" position="center 60%" kick={t('kick')} title={t.rich('title', rich)} lead={t('lead')} />

        <section className="sec">
          <div className="wrap">
            <div className="sec-head">
              <div>
                <p className="kick">{t('imagesKick')}</p>
                <Reveal><h2 className="h2">{t.rich('imagesTitle', rich)}</h2></Reveal>
              </div>
              <Reveal delay={0.1}><p className="lead">{t('imagesLead')}</p></Reveal>
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '32px 20px' }}>
              {images.map(([file, name, where, tool], k) => (
                <Reveal key={file} as="li" delay={(k % 4) * 0.06}>
                  <div className="img-r" style={{ height: 220, borderRadius: 20 }}>
                    <Image src={`/images/${file}.jpg`} alt={name} fill sizes="(max-width: 760px) 100vw, 25vw" />
                  </div>
                  <p className="mono acc" style={{ margin: '14px 0 0', fontSize: 12 }}>IMG 0{k + 1}</p>
                  <p style={{ margin: '6px 0 0', fontWeight: 700 }}>{name}</p>
                  <p className="small" style={{ marginTop: 4, fontSize: 13 }}>{where}</p>
                  <span className="tag" style={{ marginTop: 10, height: 26, fontSize: 12 }}>{tool}</span>
                </Reveal>
              ))}
            </ul>
            <div className="card" style={{ marginTop: 48, padding: '28px 32px', display: 'grid', gridTemplateColumns: 'minmax(0, 220px) 1fr', gap: 32 }}>
              <p className="kick">{t('tools')}</p>
              <p className="small" style={{ fontSize: 15 }}>{t('toolsText')}</p>
            </div>
          </div>
        </section>

        <section className="sec" style={{ paddingTop: 40 }}>
          <div className="wrap">
            <div className="sec-head" style={{ marginBottom: 24 }}>
              <div>
                <p className="kick">{t('sourcesKick')}</p>
                <Reveal><h2 className="h2">{t.rich('sourcesTitle', rich)}</h2></Reveal>
              </div>
              <Reveal delay={0.1}><p className="lead">{t('sourcesLead')}</p></Reveal>
            </div>
            {groups.map((g, k) => (
              <Reveal key={g.name} className="credits-group">
                <div>
                  <p className="mono acc" style={{ margin: 0, fontSize: 13 }}>0{k + 2}</p>
                  <h3 className="h3" style={{ marginTop: 10 }}>{g.name}</h3>
                </div>
                <div>
                  <div className="credits-row" style={{ borderTop: 0, paddingTop: 0 }} aria-hidden="true">
                    {cols.map((c) => <span key={c} className="kick muted" style={{ fontSize: 11 }}>{c}</span>)}
                  </div>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {g.rows.map(([item, author, licence, use, url]) => (
                      <li key={item} className="credits-row">
                        <strong style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19 }}>
                          {url ? <a href={url} className="lk" target="_blank" rel="noopener noreferrer">{item} <ArrowUpRight size={12} /></a> : item}
                        </strong>
                        <span style={{ fontSize: 15 }}>{author}</span>
                        <span className="mono acc" style={{ fontSize: 12.5 }}>{licence}</span>
                        <span className="small">{use}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
            <p className="small" style={{ marginTop: 32, borderTop: '1px solid var(--line)', paddingTop: 32 }}>
              {t('fix')} <Link href="/contact" className="lk acc" style={{ fontWeight: 600 }}>{t('fixLink')}</Link>{t('fixEnd')}
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
