import { getTranslations } from 'next-intl/server';
import { rich } from '@/lib/rich';
import { SITE } from '@/lib/site';
import { Footer } from './Footer';

/** Gabarit sobre des pages légales. Les champs « À compléter » sont mis en évidence. */
export async function LegalPage({ page, updated }: { page: 'legal' | 'privacy'; updated: string }) {
  const t = await getTranslations('legalPages');
  const sections = t.raw(`${page}.sections`) as { t: string; p: string[] }[];
  const todo = `[${t('todo')}]`;
  const fill = (s: string) =>
    s.replaceAll('{email}', SITE.email).replaceAll('{status}', todo).replaceAll('{siret}', todo);

  return (
    <>
      <main id="main" style={{ paddingTop: 160 }}>
        <div className="wrap" style={{ maxWidth: 900 }}>
          <p className="kick">{t(`${page}.kick`)}</p>
          <h1 className="h2" style={{ marginTop: 22 }}>{t.rich(`${page}.title`, rich)}</h1>
          <p className="small mono" style={{ marginTop: 20, fontSize: 12.5 }}>{t('updated', { date: updated })}</p>
          <div style={{ marginTop: 64, paddingBottom: 120 }}>
            {sections.map((s, k) => (
              <section key={s.t} style={{ padding: '32px 0', borderTop: '1px solid var(--line)', display: 'grid', gridTemplateColumns: 'minmax(0, 260px) 1fr', gap: 32 }} className="legal-sec">
                <h2 className="h3" style={{ fontSize: 22 }}><span className="mono acc" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>0{k + 1}</span>{s.t}</h2>
                <div>
                  {s.p.map((p) => {
                    const text = fill(p);
                    return (
                      <p key={p} className="lead" style={{ fontSize: 16, marginBottom: 12 }}>
                        {text.split(todo).flatMap((part, i, arr) => (i < arr.length - 1 ? [part, <mark key={i} style={{ background: 'rgba(240,181,15,0.18)', color: '#f7d98a', padding: '0 4px', borderRadius: 4 }}>{todo}</mark>] : [part]))}
                      </p>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
