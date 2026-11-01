'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ApiError, recommandations } from '@/lib/api';
import { rentalKey, type DpeClass } from '@/lib/dpe';
import { rich } from '@/lib/rich';
import type { Logement, Recommandations } from '@/lib/types';
import { Check, Info, Spark } from '../Icons';

const RENT_YEAR = { free: '✓', e2034: '2034', f2028: '2028', g2025: '2025' } as const;

/**
 * Agent de rénovation (`POST /agent`) : lancé à la demande, il affiche ses étapes puis les recommandations
 * telles que l'API les renvoie (textes générés). Aucun chiffre n'est calculé ni ajouté par le site.
 */
export function AgentPanel({ logement, classe }: { logement: Logement; classe: DpeClass }) {
  const t = useTranslations('result');
  const s = useTranslations('home.sim');
  const locale = useLocale();
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [step, setStep] = useState(0);
  const [rec, setRec] = useState<Recommandations | null>(null);
  const [demo, setDemo] = useState(false);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const ctrl = useRef<AbortController | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => ctrl.current?.abort(), []);
  useEffect(() => {
    if (status !== 'loading') return;
    const id = setInterval(() => setStep((x) => Math.min(x + 1, 2)), 1400);
    return () => clearInterval(id);
  }, [status]);

  const run = async () => {
    ctrl.current?.abort();
    ctrl.current = new AbortController();
    setStatus('loading');
    setStep(0);
    setErrorDetail(null);
    try {
      const r = await recommandations(logement, classe, locale, s(`chauffages.${logement.chauffage}`), ctrl.current.signal);
      // Repli de l'API quand la génération a échoué : ni travaux ni aides. On l'affiche comme une erreur.
      if (!r.demo && r.data.travaux.items.length === 0 && r.data.aides.items.length === 0) {
        setErrorDetail(r.data.situation.detail || null);
        setStatus('error');
        return;
      }
      setRec(r.data);
      setDemo(r.demo);
      setStatus('done');
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch (e) {
      if (ctrl.current.signal.aborted) return;
      if (e instanceof ApiError && e.status === 422) setErrorDetail(e.message);
      setStatus('error');
    }
  };

  const steps = t.raw('agent.steps') as string[];
  const rent = rentalKey(classe);

  return (
    <section className="sec" style={{ paddingTop: 0 }} aria-labelledby="agent-title">
      <div className="wrap">
        <div className="agent">
          <div className="agent-head">
            <div>
              <p className="kick">{t('agent.kick')}</p>
              <h2 id="agent-title" className="h2" style={{ marginTop: 22, fontSize: 'clamp(40px, 5vw, 72px)' }}>{t.rich('agent.title', rich)}</h2>
              <p className="lead" style={{ marginTop: 20, maxWidth: 560 }}>{t('agent.lead')}</p>
            </div>
            {status !== 'loading' && (
              <button type="button" className={status === 'done' ? 'btn-o' : 'btn'} onClick={run}>
                {status === 'done' ? t('agent.rerun') : t('agent.run')}
                {status !== 'done' && <span className="ic"><Spark size={18} /></span>}
              </button>
            )}
          </div>

          <div aria-live="polite" style={{ marginTop: 48 }}>
            {status === 'idle' && (
              <p className="small" style={{ fontSize: 16, maxWidth: 560 }}>{t('agent.idle')}</p>
            )}

            {status === 'loading' && (
              <div className="agent-grid" style={{ marginTop: 0 }}>
                <ol className="steps">
                  {steps.map((st, k) => (
                    <li key={st} style={{ color: k <= step ? 'var(--ink)' : 'var(--mut)' }}>
                      {k < step ? <span className="done-ic"><Check /></span> : k === step ? <span className="spin" /> : <span className="todo-ic" />}
                      {st}
                    </li>
                  ))}
                </ol>
                <div aria-hidden="true" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="skel" style={{ height: 22, width: '60%' }} />
                  <div className="skel" style={{ height: 14 }} />
                  <div className="skel" style={{ height: 14, width: '85%' }} />
                  <div className="skel" style={{ height: 120, marginTop: 12 }} />
                </div>
              </div>
            )}

            {status === 'error' && (
              <p className="notice"><Info /><span>{t('agent.error')}{errorDetail && <><br />{errorDetail}</>}</span></p>
            )}

            {status === 'done' && rec && (
              <div ref={resultRef} tabIndex={-1} style={{ outline: 'none' }}>
                {demo && <p className="notice" style={{ marginBottom: 20 }}><Info />{t('demo')}</p>}

                <div className="facts facts-2">
                  <div className="fact">
                    <p className="kick muted" style={{ fontSize: 11 }}>{t('agent.current')}</p>
                    <div className="fact-v"><span className={`cls c-${classe}`} style={{ width: 46, height: 46, fontSize: 26 }}>{classe}</span></div>
                    <p className="small" style={{ marginTop: 10, fontSize: 13 }}>{t(`labels.${classe}`)}</p>
                  </div>
                  <div className="fact">
                    <p className="kick muted" style={{ fontSize: 11 }}>{t('agent.rentalUntil')}</p>
                    <div className="fact-v">{RENT_YEAR[rent]}</div>
                    <p className="small" style={{ marginTop: 10, fontSize: 13 }}>{t(`impl.rental.${rent}.title`)}</p>
                  </div>
                </div>

                {(rec.situation.resume || rec.situation.detail) && (
                  <div className="situation">
                    <p className="kick">{t('agent.situation')}</p>
                    <div>
                      {rec.situation.resume && <p style={{ margin: 0, fontWeight: 600, fontSize: 17 }}>{rec.situation.resume}</p>}
                      {rec.situation.detail && <p className="small" style={{ marginTop: 8, fontSize: 15 }}>{rec.situation.detail}</p>}
                    </div>
                  </div>
                )}

                <div className="agent-grid">
                  <div>
                    <h3 className="h3" style={{ fontSize: 26 }}>{t('agent.works')}</h3>
                    {rec.travaux.resume && <p className="small" style={{ marginTop: 8 }}>{rec.travaux.resume}</p>}
                    <ol className="works">
                      {rec.travaux.items.map((w, k) => (
                        <li key={k} className="work">
                          <span className="mono acc" style={{ fontSize: 12 }}>{String(k + 1).padStart(2, '0')}</span>
                          <p style={{ margin: '12px 0 0', lineHeight: 1.55 }}>{w}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <h3 className="h3" style={{ fontSize: 26 }}>{t('agent.aids')}</h3>
                    {rec.aides.resume && <p className="small" style={{ marginTop: 8 }}>{rec.aides.resume}</p>}
                    <ul className="aids">
                      {rec.aides.items.map((a, k) => (
                        <li key={k} className="aid" style={{ gridTemplateColumns: '1fr' }}>
                          <p style={{ margin: 0, lineHeight: 1.55 }}>{a}</p>
                        </li>
                      ))}
                    </ul>
                    <p className="small" style={{ marginTop: 20, fontSize: 12.5 }}>{t('agent.note')}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
