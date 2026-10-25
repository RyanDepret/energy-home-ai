import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { rich } from '@/lib/rich';
import { pageMetadata } from '@/lib/seo';
import { SITE } from '@/lib/site';
import { Footer } from '@/components/Footer';
import { PhotoBand } from '@/components/PhotoBand';
import { InView, Reveal } from '@/components/Reveal';
import { ArrowUpRight } from '@/components/Icons';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return pageMetadata(locale, 'about', '/a-propos');
}

function Flow() {
  return (
    <svg className="flow" width="100%" height="40" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
      <line x1="0" y1="20" x2="100" y2="20" stroke="var(--acc)" strokeWidth="2" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('about');
  const bricks = t.raw('bricks') as { t: string; d: string }[];
  const stack = t.raw('stack') as { cat: string; items: [string, string][] }[];

  const node = (key: string, main = false) => (
    <div className={main ? 'node main' : 'node'}>
      <p className="kick muted" style={{ fontSize: 11 }}>{t(`nodes.${key}.k`)}</p>
      <p style={{ margin: '8px 0 0', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20 }}>{t(`nodes.${key}.t`)}</p>
      <p className="small" style={{ marginTop: 4, fontSize: 13 }}>{t(`nodes.${key}.d`)}</p>
    </div>
  );

  return (
    <>
      <main id="main">
        <PhotoBand src="/images/village-perche.jpg" position="center 45%" kick={t('kick')} title={t.rich('title', rich)} lead={t('lead')} />

        <section className="sec">
          <div className="wrap">
            <p className="kick">{t('approachKick')}</p>
            <Reveal><p className="manifesto-text" style={{ fontSize: 'clamp(28px, 3.6vw, 52px)', lineHeight: 1.14 }}>{t.rich('approach', rich)}</p></Reveal>
            <InView className="grid-3">
              {bricks.map((b, k) => (
                <div key={b.t} style={{ marginTop: 'clamp(56px, 7vw, 96px)' }}>
                  <div className="draw" style={{ background: 'var(--acc)', transitionDelay: `${k * 0.15}s` }} />
                  <p className="mono acc" style={{ margin: '22px 0 0', fontSize: 13 }}>0{k + 1}</p>
                  <h2 className="h3" style={{ marginTop: 12 }}>{b.t}</h2>
                  <p className="small" style={{ marginTop: 12, fontSize: 16 }}>{b.d}</p>
                </div>
              ))}
            </InView>
          </div>
        </section>

        <section className="sec" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec-head">
              <div>
                <p className="kick">{t('archiKick')}</p>
                <Reveal><h2 className="h2">{t.rich('archiTitle', rich)}</h2></Reveal>
              </div>
              <Reveal delay={0.1}><p className="lead">{t('archiLead')}</p></Reveal>
            </div>
            <Reveal className="card archi">
              {node('front')}
              <Flow />
              {node('api', true)}
              <Flow />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {node('data')}
                {node('model')}
                {node('rag')}
              </div>
            </Reveal>
          </div>
        </section>

        <section className="sec" style={{ background: 'var(--bg2)' }}>
          <div className="wrap">
            <div className="sec-head">
              <div>
                <p className="kick">{t('stackKick')}</p>
                <Reveal><h2 className="h2">{t.rich('stackTitle', rich)}</h2></Reveal>
              </div>
              <Reveal delay={0.1}><p className="lead">{t('stackLead')}</p></Reveal>
            </div>
            {stack.map((row, k) => (
              <Reveal key={row.cat} className="stack-row">
                <div>
                  <p className="mono acc" style={{ margin: 0, fontSize: 13 }}>0{k + 1} · {t('bricksCount', { n: row.items.length })}</p>
                  <h3 className="h3" style={{ marginTop: 10 }}>{row.cat}</h3>
                </div>
                <ul className="stack-items" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {row.items.map(([name, desc]) => (
                    <li key={name} className="stack-item">
                      <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17 }}>{name}</p>
                      <p className="small" style={{ marginTop: 4, fontSize: 13 }}>{desc}</p>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="sec">
          <div className="wrap two-col" style={{ gridTemplateColumns: 'minmax(0, 520px) 1fr', alignItems: 'center' }}>
            <Reveal as="figure">
              <div className="img-r" style={{ height: 'clamp(380px, 42vw, 560px)', borderRadius: 36, margin: 0 }}>
                <Image src="/images/ryan.jpg" alt={t('photoAlt')} fill sizes="(max-width: 1100px) 100vw, 520px" style={{ objectPosition: 'center 30%' }} />
              </div>
              <figcaption className="small" style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between' }}>
                <span>{t('whoCaption')}</span><span className="mono">Fig. 02</span>
              </figcaption>
            </Reveal>
            <div>
              <p className="kick">{t('whoKick')}</p>
              <Reveal><h2 className="h2" style={{ marginTop: 24 }}>{t.rich('whoTitle', rich)}</h2></Reveal>
              <Reveal delay={0.1}><p className="lead" style={{ marginTop: 28, maxWidth: 560 }}>{t('whoText')}</p></Reveal>
              <div style={{ marginTop: 36, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a href={SITE.repo} className="btn" target="_blank" rel="noopener noreferrer">
                  {t('code')}<span className="ic"><ArrowUpRight /></span>
                </a>
                <Link href="/contact" className="btn-o">{t('contact')}</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
