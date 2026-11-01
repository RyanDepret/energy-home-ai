'use client';

import { useLocale, useTranslations } from 'next-intl';
import { cleCritere } from '@/lib/criteres';
import { CLASSES } from '@/lib/dpe';
import { pct } from '@/lib/format';
import { rich } from '@/lib/rich';
import type { Importance, Prediction } from '@/lib/types';
import { ArrowUpRight } from '../Icons';

const REFORM = 'https://www.economie.gouv.fr/actualites/un-nouveau-dpe-au-1er-janvier-2026-pour-favoriser-le-chauffage-electrique';

/** Transparence du modèle : distribution des probabilités et poids des critères, tels que renvoyés par l'API. */
export function Transparency({ prediction }: { prediction: Prediction }) {
  const t = useTranslations('result.transp');
  const r = useTranslations('result');
  const s = useTranslations('home.sim');
  const locale = useLocale();
  const lt1 = r('lt1');
  const max = Math.max(...CLASSES.map((c) => prediction.probabilites[c] ?? 0), 0.01);

  /** Libellé du critère : traduit s'il est connu, sinon tel que renvoyé par l'API. */
  const libelle = (imp: Importance) => {
    const cle = cleCritere(imp.critere);
    return cle && t.has(`criteria.${cle}`) ? t(`criteria.${cle}`) : imp.critere;
  };
  /** Valeur lisible : codes de période, chauffage et type traduits ; le reste tel quel. */
  const valeur = (imp: Importance) => {
    const v = imp.valeur;
    if (v == null || v === '') return null;
    const cle = cleCritere(imp.critere);
    const txt = String(v);
    if (cle === 'surface' && typeof v === 'number') return `${new Intl.NumberFormat(locale).format(v)} m²`;
    if (cle === 'periode' && s.has(`periodes.${txt}`)) return s(`periodes.${txt}`);
    if (cle === 'chauffage' && s.has(`chauffages.${txt}`)) return s(`chauffages.${txt}`);
    if (cle === 'type_batiment' && s.has(`types.${txt}`)) return s(`types.${txt}`);
    return txt;
  };

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
                    <span className="mono" style={{ fontSize: 12, color: top ? 'var(--ink)' : 'var(--mut)', whiteSpace: 'nowrap' }}>{pct(p, locale, lt1)}</span>
                    <div className={`dist-bar c-${c}`} style={{ height: `${Math.max(3, (p / max) * 170)}px`, opacity: top ? 1 : 0.45, animationDelay: `${k * 0.05}s` }} />
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: top ? 'var(--ink)' : 'var(--mut)' }}>{c}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {prediction.importances.length > 0 && (
            <div className="card" style={{ padding: 'clamp(24px, 3vw, 36px)' }}>
              <h3 className="h3" style={{ fontSize: 22 }}>{t('weightTitle')}</h3>
              <p className="small" style={{ marginTop: 6 }}>{t('weightLead')}</p>
              <ul style={{ listStyle: 'none', margin: '24px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
                {[...prediction.importances].sort((a, b) => b.poids - a.poids).map((imp, k) => {
                  const v = valeur(imp);
                  return (
                    <li key={imp.critere}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 15 }}>
                        <span><strong>{libelle(imp)}</strong>{v && <span className="small"> · {v}</span>}</span>
                        <span className="mono" style={{ fontSize: 12.5, color: 'var(--mut)', whiteSpace: 'nowrap' }}>{pct(imp.poids, locale, lt1)}</span>
                      </div>
                      <div className="meter" aria-hidden="true">
                        <i style={{ width: `${imp.poids * 100}%`, animationDelay: `${k * 0.08}s` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {prediction.modelVersion && (
          <p className="mono" style={{ marginTop: 24, fontSize: 12, color: 'var(--mut)' }}>{t('version', { v: prediction.modelVersion })}</p>
        )}
      </div>
    </section>
  );
}
