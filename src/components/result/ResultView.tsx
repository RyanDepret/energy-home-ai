'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { predict } from '@/lib/api';
import { CLASSES, RANGES, runnerUp, rentalKey, type DpeClass } from '@/lib/dpe';
import { percent } from '@/lib/format';
import { toSearchParams } from '@/lib/logement';
import { rich } from '@/lib/rich';
import type { Logement, Prediction } from '@/lib/types';
import { Reveal } from '../Reveal';
import { ArrowLeft, ArrowUpRight, Info } from '../Icons';
import { AgentPanel } from './AgentPanel';
import { Transparency } from './Transparency';

/** Page résultat : estimation, ce qu'elle implique, plan de l'agent, transparence, questions. */
export function ResultView({ logement }: { logement: Logement }) {
  const t = useTranslations('result');
  const s = useTranslations('home.sim');
  const locale = useLocale();
  const [pred, setPred] = useState<Prediction | null>(null);
  const [demo, setDemo] = useState(false);
  const [selected, setSelected] = useState<DpeClass | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    setPred(null);
    predict(logement, ctrl.signal)
      .then((r) => { setPred(r.data); setDemo(r.demo); })
      .catch(() => { /* requête annulée */ });
    return () => ctrl.abort();
  }, [logement]);

  const chips = t('chips', {
    type: s(`types.${logement.type}`), surface: logement.surface, periode: s(`periodes.${logement.periode}`),
    chauffage: s(`chauffages.${logement.chauffage}`), cp: logement.codePostal,
  }).split(' · ');

  const classe = pred?.classe;
  const second = pred ? runnerUp(pred.probabilites, pred.classe) : null;
  const shown = selected ?? classe;
  const rent = classe ? rentalKey(classe) : 'free';
  const qs = toSearchParams(logement).toString();

  return (
    <main id="main">
      {/* Bandeau */}
      <section className="photo band">
        <div className="photo-img slowzoom">
          <Image src="/images/combles.jpg" alt="" fill priority sizes="100vw" style={{ objectPosition: 'center 40%' }} />
        </div>
        <div className="shade" />
        <div className="grain" />
        <div className="band-in wrap">
          <Link href={{ pathname: '/simulateur', query: { edit: '1', ...Object.fromEntries(new URLSearchParams(qs)) } }} className="lk back">
            <ArrowLeft /> {t('back')}
          </Link>
          <p className="kick fade" style={{ color: '#fff' }}>{t('kick')}</p>
          <h1 className="disp band-title" aria-live="polite">
            <span className="ln"><span key={classe ?? 'load'}>{classe ? t.rich('title', { ...rich, classe }) : t('loadingTitle')}</span></span>
          </h1>
          <div className="chips fade" style={{ marginTop: 28 }}>
            {chips.map((c) => <span key={c} className="chip-glass">{c}</span>)}
          </div>
        </div>
      </section>

      {demo && (
        <div className="wrap" style={{ marginTop: 32 }}>
          <p className="notice"><Info />{t('demo')}</p>
        </div>
      )}

      {/* Estimation */}
      <section className="sec">
        <div className="wrap result">
          <div>
            <p className="kick">{t('estimated')}</p>
            {pred && classe ? (
              <>
                <div className={`cls c-${classe} class-tile`} role="img" aria-label={t('classLabel', { classe, label: t(`labels.${classe}`) })}>{classe}</div>
                <p className="h3" style={{ marginTop: 24 }}>{t('classLabel', { classe, label: t(`labels.${classe}`) })}</p>
                <p className="small" style={{ marginTop: 8, fontSize: 15 }}>
                  {t('consumption')} <strong className="mono" style={{ color: 'var(--ink)' }}>{RANGES[classe]} {t('unit')}</strong>
                </p>
                <div style={{ marginTop: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <span>{t('probability')}</span>
                    <strong className="mono">{percent(pred.probabilites[classe] ?? 0, locale)}</strong>
                  </div>
                  <div className="meter"><i style={{ width: `${Math.round((pred.probabilites[classe] ?? 0) * 100)}%` }} /></div>
                  {second && (
                    <p className="small" style={{ marginTop: 12 }}>
                      {t('hesitates', { classe: second })}{' '}
                      <a href="#transparence" className="lk acc" style={{ fontWeight: 600 }}>{t('seeDetail')}</a>
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div aria-hidden="true">
                <div className="skel class-tile" />
                <div className="skel" style={{ marginTop: 24, height: 28, width: '70%' }} />
                <div className="skel" style={{ marginTop: 12, height: 16, width: '50%' }} />
              </div>
            )}
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <p className="kick">{t('scaleKick')}</p>
              <p className="kick muted">{t('scaleHint')}</p>
            </div>
            <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {CLASSES.map((c, k) => (
                <button
                  key={c} type="button" className="scale-row" aria-pressed={shown === c}
                  onClick={() => setSelected((cur) => (cur === c ? null : c))}
                >
                  <span className={`scale-bar c-${c}`} style={{ width: `${34 + k * 11}%`, opacity: shown && shown !== c ? 0.4 : 1, animationDelay: `${k * 0.06}s` }}>
                    <b>{c}</b>
                    <span className="mono" style={{ fontSize: 12 }}>{RANGES[c]}</span>
                  </span>
                  {c === classe && <span className="kick" style={{ whiteSpace: 'nowrap' }}>← {t('yours')}</span>}
                </button>
              ))}
            </div>
            {shown && (
              <p className="small" aria-live="polite" style={{ marginTop: 18 }}>
                <strong style={{ color: 'var(--ink)' }}>{t('classLabel', { classe: shown, label: t(`labels.${shown}`) })}</strong> · {RANGES[shown]} {t('unit')}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Ce que ça implique */}
      {classe && (
        <section className="sec" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <p className="kick">{t('impl.kick')}</p>
            <div className="grid-3" style={{ marginTop: 32 }}>
              {[
                { k: t('impl.rentKick'), title: t(`impl.rental.${rent}.title`), text: t(`impl.rental.${rent}.text`), c: classe },
                { k: t('impl.valueKick'), title: t('impl.valueTitle'), text: t('impl.valueText') },
                { k: t('impl.nextKick'), title: t('impl.nextTitle'), text: t('impl.nextText') },
              ].map((it, i) => (
                <Reveal key={it.k} delay={i * 0.08} className="card" >
                  <div style={{ padding: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {it.c && <span className={`cls c-${it.c}`} style={{ width: 28, height: 28, fontSize: 14, borderRadius: 8 }}>{it.c}</span>}
                      <p className="kick muted">{it.k}</p>
                    </div>
                    <p className="h3" style={{ marginTop: 18, fontSize: 24 }}>{it.title}</p>
                    <p className="small" style={{ marginTop: 12, fontSize: 15 }}>{it.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {classe && <AgentPanel logement={logement} classe={classe} />}
      {pred && <div id="transparence" style={{ scrollMarginTop: 80 }}><Transparency prediction={pred} /></div>}

      {/* Questions à l'assistant */}
      {classe && (
        <section className="sec" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <p className="kick">{t('ask.kick')}</p>
            <h2 className="h2" style={{ marginTop: 22 }}>{t.rich('ask.title', rich)}</h2>
            <div style={{ marginTop: 40 }}>
              {['q1', 'q2', 'q3'].map((q, i) => {
                const question = t(`ask.${q}`, { classe });
                return (
                  <Link key={q} href={{ pathname: '/assistant', query: { q: question, ...Object.fromEntries(new URLSearchParams(qs)) } }} className="row-link">
                    <span><small>0{i + 1}</small>{question}</span>
                    <ArrowUpRight size={20} />
                  </Link>
                );
              })}
            </div>
            <div style={{ marginTop: 48, display: 'flex', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
              <p className="small" style={{ maxWidth: 640 }}>
                <strong style={{ color: 'var(--ink)' }}>{t('ask.disclaimerStrong')}</strong> {t('ask.disclaimer')}
              </p>
              <Link href="/simulateur" className="btn-o">{t('ask.again')}</Link>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
