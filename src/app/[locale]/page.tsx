import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { rich } from '@/lib/rich';
import { pageMetadata } from '@/lib/seo';
import { Footer } from '@/components/Footer';
import { HeroSlider } from '@/components/HeroSlider';
import { Marquee } from '@/components/Marquee';
import { InView, Reveal } from '@/components/Reveal';
import { SimulatorSection } from '@/components/SimulatorSection';
import { ArrowUpRight } from '@/components/Icons';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return pageMetadata(locale, 'home', '/');
}

/** Exemple de simulation, pour montrer le plan de l'agent sans saisie. */
const SAMPLE = '/simulateur?surface=85&periode=1948-1974&type=maison&chauffage=fioul&cp=83600';

const STEP_IMAGES = ['/images/maison-pierre-crepuscule.jpg', '/images/plans.jpg', '/images/combles.jpg'];
const BRICKS = [
  { img: '/images/mas-provencal.jpg', href: '/simulateur' },
  { img: '/images/salon.jpg', href: '/assistant' },
  { img: '/images/village-perche.jpg', href: SAMPLE },
];
const LAW = ['G', 'F', 'E'] as const;

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');

  return (
    <>
      <main id="main">
        <HeroSlider />
        <Marquee items={t.raw('marquee') as string[]} />

        {/* (01) Manifeste */}
        <section className="sec">
          <div className="wrap">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
              <p className="kick">{t('manifesto.kick')}</p>
              <p className="kick muted">{t('manifesto.tag')}</p>
            </div>
            <Reveal><p className="manifesto-text">{t.rich('manifesto.text', rich)}</p></Reveal>

            <div className="grid-3" style={{ marginTop: 'clamp(64px, 8vw, 112px)' }}>
              {STEP_IMAGES.map((src, k) => (
                <Reveal key={src} delay={k * 0.1} as="figure">
                  <div className="img-r step-img" style={{ margin: 0 }}>
                    <Image src={src} alt="" fill sizes="(max-width: 760px) 100vw, 33vw" />
                  </div>
                  <figcaption className="step-cap">
                    <span className="mono acc" style={{ fontSize: 13 }}>0{k + 1}</span>
                    <span>
                      <span className="sf acc" style={{ fontSize: 26 }}>{t(`manifesto.steps.${k}.verb`)}</span>
                      <strong className="h3" style={{ display: 'block', marginTop: 4, fontSize: 26 }}>{t(`manifesto.steps.${k}.title`)}</strong>
                      <span className="small" style={{ display: 'block', marginTop: 10 }}>{t(`manifesto.steps.${k}.text`)}</span>
                    </span>
                  </figcaption>
                </Reveal>
              ))}
            </div>

            <div className="grid-3" style={{ marginTop: 'clamp(64px, 8vw, 96px)' }}>
              {[0, 1, 2].map((k) => (
                <Reveal key={k} delay={k * 0.1} className="stat">
                  <p className="disp">
                    {t(`manifesto.stats.${k}.value`)}
                    <span className="sf">{t(`manifesto.stats.${k}.unit`)}</span>
                  </p>
                  <p className="small" style={{ marginTop: 14, maxWidth: 300 }}>{t(`manifesto.stats.${k}.text`)}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* (02) Les trois briques */}
        <section className="sec" style={{ paddingTop: 0 }}>
          <div className="wrap bricks">
            <div className="bricks-aside">
              <p className="kick">{t('bricks.kick')}</p>
              <Reveal><h2 className="h2" style={{ marginTop: 22 }}>{t.rich('bricks.title', rich)}</h2></Reveal>
              <Reveal delay={0.1}><p className="lead" style={{ marginTop: 24 }}>{t('bricks.lead')}</p></Reveal>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {BRICKS.map((b, k) => (
                <Reveal key={b.img} className="card brick">
                  <div className="brick-img">
                    <Image src={b.img} alt="" fill sizes="(max-width: 760px) 100vw, 30vw" />
                  </div>
                  <div className="brick-body">
                    <div>
                      <p className="mono acc" style={{ margin: 0, fontSize: 13 }}>0{k + 1} / 03</p>
                      <h3 className="h3" style={{ marginTop: 16 }}>
                        {t(`bricks.items.${k}.t1`)} <span className="sf acc">{t(`bricks.items.${k}.t2`)}</span>
                      </h3>
                      <p className="small" style={{ marginTop: 14, fontSize: 15 }}>{t(`bricks.items.${k}.text`)}</p>
                      <div className="tags" style={{ marginTop: 18 }}>
                        {(t.raw(`bricks.items.${k}.tags`) as string[]).map((tag) => <span key={tag} className="tag">{tag}</span>)}
                      </div>
                    </div>
                    <Link href={b.href} className="lk lk-u" style={{ alignSelf: 'flex-start', fontWeight: 600, display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                      {t(`bricks.items.${k}.cta`)} <ArrowUpRight />
                    </Link>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* (03) Simulateur */}
        <SimulatorSection />

        {/* (04) Calendrier de la loi */}
        <section className="sec">
          <div className="wrap">
            <div className="sec-head">
              <div>
                <p className="kick">{t('law.kick')}</p>
                <Reveal><h2 className="h2">{t.rich('law.title', rich)}</h2></Reveal>
              </div>
              <Reveal delay={0.1}><p className="lead">{t('law.lead')}</p></Reveal>
            </div>
            <InView className="grid-3">
              {LAW.map((c, k) => (
                <div key={c}>
                  <div className="draw" style={{ background: `var(--c${c})`, transitionDelay: `${k * 0.15}s` }} />
                  <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className={`cls c-${c}`} style={{ width: 40, height: 40, fontSize: 20 }}>{c}</span>
                    <span className="kick muted">{t(`law.items.${k}.when`)}</span>
                  </div>
                  <p className="year">{t(`law.items.${k}.year`)}</p>
                  <p className="small" style={{ marginTop: 16, fontSize: 16, maxWidth: 320 }}>{t(`law.items.${k}.text`)}</p>
                </div>
              ))}
            </InView>
          </div>
        </section>

        {/* Appel final */}
        <section className="photo cta-final">
          <div className="photo-img">
            <Image src="/images/village-perche.jpg" alt="" fill sizes="100vw" style={{ objectPosition: 'center 45%' }} />
          </div>
          <div className="shade-up" />
          <div className="grain" />
          <div className="wrap cta-final-in">
            <Reveal><h2 className="disp cta-title">{t.rich('cta.title', rich)}</h2></Reveal>
            <Link href="/simulateur" className="btn btn-lg">
              {t('cta.button')}
              <span className="ic"><ArrowUpRight /></span>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
