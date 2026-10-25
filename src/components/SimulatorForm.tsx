'use client';

import { useId, useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { CHAUFFAGES, isPacaPostalCode, PERIODES, toSearchParams, TYPES } from '@/lib/logement';
import type { Chauffage, Logement, Periode, TypeLogement } from '@/lib/types';
import { ArrowUpRight } from './Icons';

function Seg<T extends string>({ label, options, value, onChange, labelOf }: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void; labelOf: (v: T) => string }) {
  return (
    <fieldset style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
      <legend className="lbl">{label}</legend>
      <div className="seg">
        {options.map((o) => (
          <button key={o} type="button" aria-pressed={o === value} onClick={() => onChange(o)}>
            {labelOf(o)}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/** Formulaire des 5 informations. Envoie vers /simulateur avec les paramètres dans l'URL (partageable). */
export function SimulatorForm({ initial }: { initial?: Logement | null }) {
  const t = useTranslations('home.sim');
  const router = useRouter();
  const id = useId();
  const [surface, setSurface] = useState(initial ? String(initial.surface) : '');
  const [periode, setPeriode] = useState<Periode>(initial?.periode ?? '1948-1974');
  const [type, setType] = useState<TypeLogement>(initial?.type ?? 'maison');
  const [chauffage, setChauffage] = useState<Chauffage>(initial?.chauffage ?? 'electricite');
  const [cp, setCp] = useState(initial?.codePostal ?? '');
  const [touched, setTouched] = useState(false);

  const s = Number(surface.replace(',', '.'));
  const surfaceOk = Number.isFinite(s) && s >= 9 && s <= 1000;
  const cpOk = isPacaPostalCode(cp.trim());

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!surfaceOk || !cpOk) {
      document.getElementById(!surfaceOk ? `${id}-s` : `${id}-cp`)?.focus();
      return;
    }
    const qs = toSearchParams({ surface: Math.round(s), periode, type, chauffage, codePostal: cp.trim() });
    router.push(`/simulateur?${qs.toString()}`);
  };

  return (
    <form className="card form" style={{ padding: 'clamp(24px, 3vw, 40px)' }} onSubmit={submit} noValidate>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <p className="h3" style={{ fontSize: 26 }}>{t('card')}</p>
        <span className="mono acc" style={{ fontSize: 12 }}>{t('duration')}</span>
      </div>

      <div>
        <label className="lbl" htmlFor={`${id}-s`}>{t('surface')}</label>
        <div style={{ position: 'relative' }}>
          <input
            id={`${id}-s`} className="inp" inputMode="decimal" autoComplete="off" placeholder={t('surfacePh')}
            value={surface} onChange={(e) => setSurface(e.target.value)}
            aria-invalid={touched && !surfaceOk} aria-describedby={touched && !surfaceOk ? `${id}-se` : undefined}
          />
          <span className="mono" style={{ position: 'absolute', right: 16, top: 17, fontSize: 14, color: 'var(--mut)' }} aria-hidden="true">m²</span>
        </div>
        {touched && !surfaceOk && <p id={`${id}-se`} className="field-err">{t('surfaceError')}</p>}
      </div>

      <Seg label={t('periode')} options={PERIODES} value={periode} onChange={setPeriode} labelOf={(v) => t(`periodes.${v}`)} />
      <Seg label={t('type')} options={TYPES} value={type} onChange={setType} labelOf={(v) => t(`types.${v}`)} />
      <Seg label={t('chauffage')} options={CHAUFFAGES} value={chauffage} onChange={setChauffage} labelOf={(v) => t(`chauffages.${v}`)} />

      <div>
        <label className="lbl" htmlFor={`${id}-cp`}>{t('cp')}</label>
        <input
          id={`${id}-cp`} className="inp" inputMode="numeric" autoComplete="postal-code" maxLength={5} placeholder={t('cpPh')}
          value={cp} onChange={(e) => setCp(e.target.value.replace(/\D/g, ''))}
          aria-invalid={touched && !cpOk} aria-describedby={`${id}-cph`}
        />
        <p id={`${id}-cph`} className={touched && !cpOk ? 'field-err' : 'small'} style={{ marginTop: 6, fontSize: 13 }}>
          {touched && !cpOk ? t('cpError') : t('cpHelp')}
        </p>
      </div>

      <button type="submit" className="btn btn-lg" style={{ width: '100%' }}>
        {t('submit')}
        <span className="ic"><ArrowUpRight /></span>
      </button>
      <p className="small" style={{ fontSize: 12.5, textAlign: 'center' }}>{t('disclaimer')}</p>
    </form>
  );
}
