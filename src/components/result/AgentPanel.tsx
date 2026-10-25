'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { renovationPlan } from '@/lib/api';
import { rentalKey, type DpeClass } from '@/lib/dpe';
import { euros, kEurosRange } from '@/lib/format';
import { rich } from '@/lib/rich';
import type { Logement, PlanRenovation } from '@/lib/types';
import { Check, Info, Spark } from '../Icons';

const RENT_YEAR = { free: '✓', e2034: '2034', f2028: '2028', g2025: '2025' } as const;

/** Agent de rénovation : lancé à la demande, il affiche ses étapes puis un plan chiffré lisible. */
export function AgentPanel({ logement, classe }: { logement: Logement; classe: DpeClass }) {
  const t = useTranslations('result');
  const locale = useLocale();
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState<PlanRenovation | null>(null);
  const [demo, setDemo] = useState(false);
  const ctrl = useRef<AbortController | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => ctrl.current?.abort(), []);
  useEffect(() => {
    if (status !== 'loading') return;
    const id = setInterval(() => setStep((s) => Math.min(s + 1, 2)), 1400);
    return () => clearInterval(id);
  }, [status]);

  const run = async () => {
    ctrl.current?.abort();
    ctrl.current = new AbortController();
    setStatus('loading');
    setStep(0);
    try {
      const r = await renovationPlan(logement, classe, ctrl.current.signal);
      setPlan(r.data);
      setDemo(r.demo);
      setStatus('done');
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch {
      if (!ctrl.current.signal.aborted) setStatus('error');
    }
  };

  const steps = t.raw('agent.steps') as string[];
  const rent = rentalKey(classe);
  const total = plan ? plan.travaux.reduce((a, w) => ({ min: a.min + w.coutMin, max: a.max + w.coutMax }), { min: 0, max: 0 }) : null;

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
                  {steps.map((s, k) => (
                    <li key={s} style={{ color: k <= step ? 'var(--ink)' : 'var(--mut)' }}>
                      {k < step ? <span className="done-ic"><Check /></span> : k === step ? <span className="spin" /> : <span className="todo-ic" />}
                      {s}
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

            {status === 'error' && <p className="notice"><Info />{t('agent.error')}</p>}

            {status === 'done' && plan && total && (
              <div ref={resultRef} tabIndex={-1} style={{ outline: 'none' }}>
                {demo && <p className="notice" style={{ marginBottom: 20 }}><Info />{t('demo')}</p>}

                <div className="facts">
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
                  <div className="fact">
                    <p className="kick muted" style={{ fontSize: 11 }}>{t('agent.goal')}</p>
                    <div className="fact-v"><span className={`cls c-${plan.objectif}`} style={{ width: 46, height: 46, fontSize: 26 }}>{plan.objectif}</span></div>
                    <p className="small" style={{ marginTop: 10, fontSize: 13 }}>{t('agent.goalText')}</p>
                  </div>
                  <div className="fact">
                    <p className="kick muted" style={{ fontSize: 11 }}>{t('agent.budget')}</p>
                    <div className="fact-v" style={{ fontSize: 'clamp(22px, 2.2vw, 30px)', whiteSpace: 'nowrap' }}>{kEurosRange(total.min, total.max, locale)}</div>
                    <p className="small" style={{ marginTop: 10, fontSize: 13 }}>{t('agent.budgetText')}</p>
                  </div>
                </div>

                <div className="situation">
                  <p className="kick">{t('agent.situation')}</p>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 17 }}>{plan.situation}</p>
                    <p className="small" style={{ marginTop: 8, fontSize: 15 }}>{plan.details}</p>
                  </div>
                </div>

                <div className="agent-grid">
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <h3 className="h3" style={{ fontSize: 26 }}>{t('agent.works')}</h3>
                      <span className="kick muted" style={{ fontSize: 11 }}>{t('agent.byImpact')}</span>
                    </div>
                    <ol className="works">
                      {plan.travaux.map((w, k) => (
                        <li key={w.titre} className="work">
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                            <span className="mono acc" style={{ fontSize: 12 }}>0{k + 1}</span>
                            <span className={w.impact === 'fort' ? 'tag acc' : 'tag'}>{t(`agent.impact.${w.impact}`)}</span>
                          </div>
                          <p style={{ margin: '16px 0 0', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19, letterSpacing: '-0.01em' }}>{w.titre}</p>
                          <p className="small" style={{ marginTop: 8, flex: 1 }}>{w.description}</p>
                          <div className="work-price">
                            <span className="small" style={{ fontSize: 12.5 }}>{t('agent.cost')}</span>
                            <strong className="mono" style={{ fontSize: 14, whiteSpace: 'nowrap' }}>{euros(w.coutMin, locale)} – {euros(w.coutMax, locale)}</strong>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <h3 className="h3" style={{ fontSize: 26 }}>{t('agent.aids')}</h3>
                      <span className="kick muted" style={{ fontSize: 11 }}>{t('agent.rules')}</span>
                    </div>
                    <ul className="aids">
                      {plan.aides.map((a) => (
                        <li key={a.nom} className="aid">
                          <div>
                            <p style={{ margin: 0, fontWeight: 700 }}>{a.nom}</p>
                            <p className="small" style={{ marginTop: 4 }}>{a.description}</p>
                          </div>
                          <span className="tag acc">{a.statut}</span>
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
