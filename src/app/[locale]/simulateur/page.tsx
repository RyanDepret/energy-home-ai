import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { fromSearchParams } from '@/lib/logement';
import { pageMetadata } from '@/lib/seo';
import { Footer } from '@/components/Footer';
import { PhotoBand } from '@/components/PhotoBand';
import { SimulatorForm } from '@/components/SimulatorForm';
import { ResultView } from '@/components/result/ResultView';
import { rich } from '@/lib/rich';

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

/**
 * La canonique pointe toujours vers /simulateur. Avec des paramètres (résultat, ?edit=1, URL invalide),
 * la page n'est pas indexée, pour éviter des milliers de variantes dans Google ; les liens restent suivis.
 */
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const hasParams = Object.keys(await searchParams).length > 0;
  return { ...(await pageMetadata(locale, 'result', '/simulateur')), robots: { index: !hasParams, follow: true } };
}

/**
 * /simulateur sans paramètres (ou avec ?edit=1) : le formulaire.
 * Avec des paramètres valides : le résultat. Les paramètres sont dans l'URL, donc le résultat se partage.
 */
export default async function SimulateurPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const usp = new URLSearchParams(Object.entries(sp).flatMap(([k, v]) => (typeof v === 'string' ? [[k, v]] : [])));
  const logement = fromSearchParams(usp);
  const edit = usp.get('edit') === '1';

  if (logement && !edit) {
    return (
      <>
        <ResultView logement={logement} />
        <Footer />
      </>
    );
  }

  const t = await getTranslations('home.sim');
  const r = await getTranslations('result');
  const invalid = usp.size > 0 && !logement && !edit;
  return (
    <>
      <main id="main">
        <PhotoBand
          src="/images/mas-provencal.jpg" position="center 60%"
          kick={t('kick')} title={t.rich('title', rich)} lead={invalid ? r('invalidText') : t('lead')}
        />
        <section className="sec">
          <div className="wrap" style={{ maxWidth: 720 }}>
            {invalid && <p className="notice" style={{ marginBottom: 24 }}>{r('invalidTitle')} {r('invalidText')}</p>}
            <SimulatorForm initial={logement} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
