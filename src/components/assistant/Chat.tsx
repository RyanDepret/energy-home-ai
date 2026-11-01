'use client';

import { Fragment, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { chat } from '@/lib/api';
import { toSearchParams } from '@/lib/logement';
import type { Logement, ReponseChat } from '@/lib/types';
import { LogoMark } from '../Logo';
import { ArrowUpRight, Info } from '../Icons';

type Answer = { rep: ReponseChat; demo: boolean };
type Turn = { id: number; question: string; answer: Answer | null; error?: boolean };

/** Gras **…** en ligne. */
function inline(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, k) => {
    const m = /^\*\*([^*]+)\*\*$/.exec(part);
    return m ? <strong key={k}>{m[1]}</strong> : <Fragment key={k}>{part}</Fragment>;
  });
}

/** Mise en forme minimale de la réponse générée : paragraphes, puces (« - », « * », « • »), titres « # » et gras. */
function Formatted({ text }: { text: string }) {
  const blocks = text.trim().split(/\n\s*\n/);
  return (
    <div className="answer">
      {blocks.map((b, k) => {
        const lines = b.split('\n').map((l) => l.trim()).filter(Boolean);
        if (lines.length > 0 && lines.every((l) => /^[-*•]\s+/.test(l))) {
          return <ul key={k}>{lines.map((l, i) => <li key={i}>{inline(l.replace(/^[-*•]\s+/, ''))}</li>)}</ul>;
        }
        return (
          <p key={k}>
            {lines.map((l, i) => (
              <Fragment key={i}>{i > 0 && <br />}{inline(l.replace(/^#+\s+/, ''))}</Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

/** Réponse et extraits utilisés, tels que renvoyés par l'API (aucun titre ni lien ajouté). */
function AnswerBody({ a, t, locale }: { a: Answer; t: ReturnType<typeof useTranslations>; locale: string }) {
  return (
    <>
      {a.demo && <p className="notice" style={{ marginBottom: 14, fontSize: 13 }}><Info size={16} />{t('demo')}</p>}
      <Formatted text={a.rep.texte} />
      {a.rep.sources.length > 0 && (
        <div className="sources">
          <p className="kick muted" style={{ fontSize: 11 }}>{t('sources')}</p>
          <ol className="excerpts">
            {a.rep.sources.map((src, k) => (
              <li key={k} className="excerpt">
                <span className="cite" aria-hidden="true">{k + 1}</span>
                <span>
                  {src.extrait}
                  {!a.demo && (
                    <span className="mono" style={{ display: 'block', marginTop: 4, fontSize: 11 }}>
                      {t('score', { s: new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(src.score) })}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </>
  );
}

export function Chat({ logement, initialQuestion }: { logement: Logement | null; initialQuestion?: string }) {
  const t = useTranslations('assistant');
  const s = useTranslations('home.sim');
  const locale = useLocale();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState(initialQuestion ?? '');
  const [phase, setPhase] = useState(0);
  const ctrl = useRef<AbortController | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);
  const busy = turns.some((x) => x.answer === null && !x.error);

  useEffect(() => () => ctrl.current?.abort(), []);
  useEffect(() => {
    if (!busy) return;
    setPhase(0);
    const id = setInterval(() => setPhase((p) => Math.min(p + 1, 2)), 1100);
    return () => clearInterval(id);
  }, [busy]);
  useEffect(() => {
    logRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [turns]);

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || busy) return;
    const id = nextId.current++;
    setTurns((ts) => [...ts, { id, question: q, answer: null }]);
    setInput('');
    const signal = (ctrl.current = new AbortController()).signal;
    try {
      const r = await chat(q, locale, signal);
      setTurns((ts) => ts.map((x) => (x.id === id ? { ...x, answer: { rep: r.data, demo: r.demo } } : x)));
    } catch {
      if (signal.aborted) {
        setTurns((ts) => ts.filter((x) => x.id !== id)); // arrêt demandé par l’utilisateur
        setInput(q);
      } else {
        setTurns((ts) => ts.map((x) => (x.id === id ? { ...x, error: true } : x))); // erreur renvoyée par l’API
      }
    }
  };

  const submit = (e: FormEvent) => { e.preventDefault(); void ask(input); };
  const reset = () => { ctrl.current?.abort(); setTurns([]); setInput(''); };
  const phases = t.raw('phases') as string[];
  const suggestions = t.raw('suggestions') as string[];
  const steps = t.raw('howSteps') as { t: string; d: string }[];

  return (
    <div className="chat-layout">
      <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <p className="kick">{t('home')}</p>
            <Link href={logement ? `/simulateur?edit=1&${toSearchParams(logement)}` : '/simulateur'} className="lk acc" style={{ fontSize: 13, fontWeight: 600 }}>{t('edit')}</Link>
          </div>
          {logement ? (
            <>
              <div className="chips" style={{ marginTop: 16 }}>
                {[t(`types.${logement.type}`), `${logement.surface} m²`, logement.annee != null ? String(logement.annee) : s(`periodes.${logement.periode}`), s(`chauffages.${logement.chauffage}`), logement.codePostal].map((c) => <span key={c} className="chip">{c}</span>)}
              </div>
              <p className="small" style={{ marginTop: 14, fontSize: 13 }}>{t('homeHelp')}</p>
            </>
          ) : (
            <p className="small" style={{ marginTop: 14 }}>{t('homeNone')}</p>
          )}
        </div>
        <div className="card" style={{ padding: 24 }}>
          <p className="kick">{t('how')}</p>
          <ol style={{ listStyle: 'none', margin: '16px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {steps.map((st, k) => (
              <li key={st.t} style={{ display: 'grid', gridTemplateColumns: '28px 1fr', gap: 8 }}>
                <span className="mono acc" style={{ fontSize: 12 }}>0{k + 1}</span>
                <span><strong>{st.t}</strong><span className="small" style={{ display: 'block', marginTop: 2, fontSize: 13 }}>{st.d}</span></span>
              </li>
            ))}
          </ol>
        </div>
        <button type="button" className="btn-o" onClick={reset}>{t('new')}</button>
      </aside>

      <div className="card chat">
        <div className="chat-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="avatar"><LogoMark size={26} still /></span>
            <div>
              <p style={{ margin: 0, fontWeight: 700 }}>{t('name')}</p>
              <p className="small" style={{ fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 8 }}><span className="dot" />{t('status')}</p>
            </div>
          </div>
          {/* L'API ne propose qu'un modèle : la comparaison est annoncée, pas simulée. */}
          <div className="seg" role="group" aria-label={t('modelGroup')}>
            <button type="button" aria-pressed="true">{t('modes.claude')}</button>
            <button type="button" disabled aria-disabled="true">{t('modes.comparer')} · {t('modes.soon')}</button>
          </div>
        </div>

        <div className="chat-log" ref={logRef} aria-live="polite">
          <div className="bubble-a">
            <span className="avatar" aria-hidden="true"><LogoMark size={26} still /></span>
            <div className="bubble-a-body">{t('welcome')}</div>
          </div>

          {turns.map((turn) => (
            <Fragment key={turn.id}>
              <div className="bubble-u">{turn.question}</div>
              <div className="bubble-a" role={turn.answer === null && !turn.error ? 'status' : undefined}>
                <span className="avatar" aria-hidden="true"><LogoMark size={26} still /></span>
                {turn.error ? (
                  <div className="bubble-a-body"><p className="notice" style={{ margin: 0 }}><Info size={16} />{t('error')}</p></div>
                ) : turn.answer === null ? (
                  <div className="bubble-a-body" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className="spin" />
                    <span><span className="sr-only">{t('preparing')} : </span>{phases[phase]}…</span>
                  </div>
                ) : (
                  <div className="bubble-a-body">
                    <AnswerBody a={turn.answer} t={t} locale={locale} />
                  </div>
                )}
              </div>
            </Fragment>
          ))}
        </div>

        <form className="composer" onSubmit={submit}>
          {turns.length === 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {suggestions.map((q) => (
                <button key={q} type="button" className="btn-o btn-sm" onClick={() => void ask(q)}>{q}</button>
              ))}
            </div>
          )}
          <label htmlFor="chat-input" className="sr-only">{t('inputLabel')}</label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <textarea
              id="chat-input" className="inp" rows={1} style={{ height: 56, minHeight: 56, paddingTop: 16 }}
              placeholder={t('placeholder')} value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void ask(input); } }}
            />
            {busy ? (
              <button type="button" className="btn-o" onClick={() => ctrl.current?.abort()}>{t('stop')}</button>
            ) : (
              <button type="submit" className="btn" disabled={!input.trim()} style={{ paddingRight: 8 }}>
                {t('send')}<span className="ic"><ArrowUpRight /></span>
              </button>
            )}
          </div>
          <p className="small" style={{ marginTop: 10, fontSize: 12 }}>{t('disclaimer')}</p>
        </form>
      </div>
    </div>
  );
}
