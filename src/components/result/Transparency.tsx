'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { sendFeedback } from '@/lib/api';
import { CLASSES, type DpeClass } from '@/lib/dpe';
import { percent } from '@/lib/format';
import { rich } from '@/lib/rich';
import type { Prediction } from '@/lib/types';
import { ArrowUpRight, Check } from '../Icons';

const REFORM = 'https://www.economie.gouv.fr/actualites/un-nouveau-dpe-au-1er-janvier-2026-pour-favoriser-le-chauffage-electrique';

function Feedback({ predicted }: { predicted: DpeClass }) {
  const t = useTranslations('result.transp');
  const [state, setState] = useState<'ask' | 'official' | 'thanks'>('ask');
  const [official, setOfficial] = useState<DpeClass | null>(null);

  if (state === 'thanks') {
    return <p role="status" style={{ margin: 0, display: 'flex', gap: 10, alignItems: 'center' }}><span className="done-ic"><Check /></span>{t('thanks')}</p>;
  }
  return (
    <div>
      <p style={{ margin: 0, fontWeight: 700 }}>{t('fbQuestion')}</p>
      {state === 'ask' && (
        <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" className="btn-o btn-sm" onClick={() => { void sendFeedback({ juste: true, classePredite: predicted }); setState('thanks'); }}>{t('yes')}</button>
          <button type="button" className="btn-o btn-sm" onClick={() => setState('official')}>{t('no')}</button>
        </div>
      )}
      {state === 'official' && (
        <fieldset style={{ border: 0, padding: 0, margin: '14px 0 0' }}>
          <legend className="lbl">{t('official')}</legend>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {CLASSES.map((c) => (
              <button
                key={c} type="button" aria-pressed={official === c} onClick={() => setOfficial(c)}
                className={`cls c-${c}`}
                style={{ width: 42, height: 42, fontSize: 18, border: 0, cursor: 'pointer', outline: official === c ? '3px solid var(--ink)' : 'none', outlineOffset: 2 }}
              >
                {c}
              </button>
            ))}
            <button
              type="button" className="btn btn-sm" disabled={!official} style={{ paddingRight: 16, marginLeft: 6 }}
              onClick={() => { if (official) { void sendFeedback({ juste: false, classePredite: predicted, classeOfficielle: official }); setState('thanks'); } }}
            >
              {t('send')}
            </button>
          </div>
        </fieldset>
      )}
      <p className="small" style={{ marginTop: 12, fontSize: 12.5 }}>{t('anon')}</p>
    </div>
  );
}

/** Transparence du modèle : distribution des probabilités, poids des critères, retour utilisateur. */
export function Transparency({ prediction }: { prediction: Prediction }) {
  const t = useTranslations('result.transp');
  const locale = useLocale();
  const max = Math.max(...CLASSES.map((c) => prediction.probabilites[c] ?? 0), 0.01);
  const level = (w: number) => (w >= 0.66 ? 'high' : w >= 0.33 ? 'mid' : 'low');

  return (
    <section className="sec" style={{ paddingTop: 0 }} aria-labelledby="transp-title">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <p className="kick">{t('kick')}</p>
            <h2 id="transp-title" className="h2">{t.rich('title', rich)}</h2>
          </div>
          <div>
            <p className="lead">{t('lead')}</p>
            <a href={REFORM} target="_blank" rel="noopener noreferrer" className="chip" style={{ marginTop: 18, textDecoration: 'none', color: 'var(--acc)' }}>
              <span className="dot" />{t('uptodate')} · {t('source')} <ArrowUpRight size={12} />
            </a>
          </div>
        </div>

        <div className="grid-2" style={{ gap: 24 }}>
          <div className="card" style={{ padding: 'clamp(24px, 3vw, 36px)' }}>
            <h3 className="h3" style={{ fontSize: 22 }}>{t('probaTitle')}</h3>
            <div className="dist">
              {CLASSES.map((c, k) => {
                const p = prediction.probabilites[c] ?? 0;
                const top = c === prediction.classe;
                return (
                  <div key={c} className="dist-col" style={{ height: '100%', justifyContent: 'flex-end' }}>
                    <span className="mono" style={{ fontSize: 12, color: top ? 'var(--ink)' : 'var(--mut)' }}>{percent(p, locale)}</span>
                    <div className={`dist-bar c-${c}`} style={{ height: `${Math.max(3, (p / max) * 170)}px`, opacity: top ? 1 : 0.45, animationDelay: `${k * 0.05}s` }} />
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: top ? 'var(--ink)' : 'var(--mut)' }}>{c}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card" style={{ padding: 'clamp(24px, 3vw, 36px)' }}>
            <h3 className="h3" style={{ fontSize: 22 }}>{t('weightTitle')}</h3>
            <p className="small" style={{ marginTop: 6 }}>{t('weightLead')}</p>
            <ul style={{ listStyle: 'none', margin: '24px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[...prediction.importances].sort((a, b) => b.poids - a.poids).map((imp, k) => (
                <li key={imp.critere}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 15 }}>
                    <span><strong>{t.has(`criteria.${imp.critere}`) ? t(`criteria.${imp.critere}`) : imp.critere}</strong></span>
                    <span className="mono" style={{ fontSize: 12.5, color: 'var(--mut)' }}>{t(`levels.${level(imp.poids)}`)}</span>
                  </div>
                  <div className="meter" role="img" aria-label={`${percent(imp.poids, locale)}`}>
                    <i style={{ width: `${Math.round(imp.poids * 100)}%`, animationDelay: `${k * 0.08}s` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="card" style={{ marginTop: 24, padding: 'clamp(24px, 3vw, 32px)', display: 'flex', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <Feedback predicted={prediction.classe} />
          {prediction.modelVersion && <span className="mono" style={{ fontSize: 12, color: 'var(--mut)' }}>{t('version', { v: prediction.modelVersion })}</span>}
        </div>
      </div>
    </section>
  );
}
