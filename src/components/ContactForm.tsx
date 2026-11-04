'use client';

import { useId, useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { SITE } from '@/lib/site';
import { ArrowUpRight, Check } from './Icons';

type Topic = 'logement' | 'pro' | 'recrutement';
type Errors = Partial<Record<'name' | 'email' | 'message' | 'consent' | 'server', true>>;

export function ContactForm() {
  const t = useTranslations('contact');
  const id = useId();
  const [topic, setTopic] = useState<Topic>('logement');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [errors, setErrors] = useState<Errors>({});

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const data = {
      topic,
      name: String(fd.get('name') ?? '').trim(),
      email: String(fd.get('email') ?? '').trim(),
      company: String(fd.get('company') ?? '').trim(),
      message: String(fd.get('message') ?? '').trim(),
      consent: fd.get('consent') === 'on',
      website: String(fd.get('website') ?? ''), // champ piège anti-robots, invisible
    };
    const errs: Errors = {};
    if (!data.name) errs.name = true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errs.email = true;
    if (data.message.length < 10) errs.message = true;
    if (!data.consent) errs.consent = true;
    setErrors(errs);
    if (Object.keys(errs).length) {
      (form.querySelector('[aria-invalid="true"]') as HTMLElement | null)?.focus();
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error(String(res.status));
      setStatus('sent');
      form.reset();
    } catch {
      setErrors({ server: true });
      setStatus('idle');
    }
  };

  if (status === 'sent') {
    return (
      <div className="card" role="status" style={{ padding: 40 }}>
        <span className="done-ic" style={{ width: 44, height: 44 }}><Check size={20} /></span>
        <p className="h3" style={{ marginTop: 22 }}>{t('sent')}</p>
        <p className="small" style={{ marginTop: 10, fontSize: 16 }}>{t('sentText')}</p>
        <button type="button" className="btn-o" style={{ marginTop: 28 }} onClick={() => setStatus('idle')}>{t('again')}</button>
      </div>
    );
  }

  const err = (k: keyof Errors) => (errors[k] ? <p id={`${id}-${k}-e`} className="field-err">{t(`errors.${k}`)}</p> : null);
  const aria = (k: keyof Errors) => ({ 'aria-invalid': !!errors[k], 'aria-describedby': errors[k] ? `${id}-${k}-e` : undefined });

  return (
    <form className="card form" style={{ padding: 'clamp(24px, 3vw, 40px)' }} onSubmit={submit} noValidate>
      <p className="h3" style={{ fontSize: 26 }}>{t('formTitle')}</p>
      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="lbl">{t('topic')}</legend>
        <div className="seg">
          {(['logement', 'pro', 'recrutement'] as const).map((k) => (
            <button key={k} type="button" aria-pressed={topic === k} onClick={() => setTopic(k)}>{t(`topics.${k}`)}</button>
          ))}
        </div>
      </fieldset>
      <div className="form-2">
        <div>
          <label className="lbl" htmlFor={`${id}-n`}>{t('name')}</label>
          <input id={`${id}-n`} name="name" className="inp" autoComplete="name" {...aria('name')} />
          {err('name')}
        </div>
        <div>
          <label className="lbl" htmlFor={`${id}-e`}>{t('email')}</label>
          <input id={`${id}-e`} name="email" type="email" className="inp" autoComplete="email" {...aria('email')} />
          {err('email')}
        </div>
      </div>
      {topic !== 'logement' && (
        <div>
          <label className="lbl" htmlFor={`${id}-c`}>{t('company')}</label>
          <input id={`${id}-c`} name="company" className="inp" autoComplete="organization" />
        </div>
      )}
      <div>
        <label className="lbl" htmlFor={`${id}-m`}>{t('message')}</label>
        <textarea id={`${id}-m`} name="message" className="inp" placeholder={t(`placeholders.${topic}`)} {...aria('message')} />
        {err('message')}
      </div>
      <div aria-hidden="true" style={{ position: 'absolute', left: -9999, width: 1, height: 1, overflow: 'hidden' }}>
        <input name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div>
        <label className="check">
          <input type="checkbox" name="consent" {...aria('consent')} />
          <span>{t('consent')} <Link href="/confidentialite" className="lk acc">{t('privacy')}</Link></span>
        </label>
        {err('consent')}
      </div>
      {errors.server && <p className="notice" role="alert">{t('errors.server')} <a href={`mailto:${SITE.email}`} className="lk" style={{ fontWeight: 700 }}>{SITE.email}</a></p>}
      <button type="submit" className="btn btn-lg btn-block" disabled={status === 'sending'}>
        {status === 'sending' ? t('sending') : t('submit')}
        <span className="ic"><ArrowUpRight /></span>
      </button>
    </form>
  );
}
