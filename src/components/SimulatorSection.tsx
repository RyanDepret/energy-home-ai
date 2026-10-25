import { getTranslations } from 'next-intl/server';
import { CLASSES } from '@/lib/dpe';
import { rich } from '@/lib/rich';
import { Reveal } from './Reveal';
import { SimulatorForm } from './SimulatorForm';

/** Section simulateur : argumentaire à gauche, formulaire à droite. Utilisée sur l'accueil et /simulateur. */
export async function SimulatorSection({ headingLevel = 2 }: { headingLevel?: 1 | 2 }) {
  const t = await getTranslations('home.sim');
  const H = headingLevel === 1 ? 'h1' : 'h2';
  return (
    <section id="simulateur" className="sec" style={{ background: 'var(--bg2)', scrollMarginTop: 80 }}>
      <div className="wrap sim">
        <div>
          <p className="kick">{t('kick')}</p>
          <Reveal><H className="h2" style={{ marginTop: 22 }}>{t.rich('title', rich)}</H></Reveal>
          <Reveal delay={0.1}><p className="lead" style={{ marginTop: 28, maxWidth: 520 }}>{t('lead')}</p></Reveal>
          <div className="scale-bars" role="img" aria-label={t('scale')}>
            {CLASSES.map((c, k) => (
              <span key={c} className={`cls c-${c}`} style={{ height: 70 + k * 26 }}>{c}</span>
            ))}
          </div>
        </div>
        <Reveal delay={0.1}><SimulatorForm /></Reveal>
      </div>
    </section>
  );
}
