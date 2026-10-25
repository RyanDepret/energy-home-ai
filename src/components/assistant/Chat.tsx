'use client';

import { Fragment, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { chat, sendVote } from '@/lib/api';
import { toSearchParams } from '@/lib/logement';
import type { Logement, Modele, ReponseChat } from '@/lib/types';
import { LogoMark } from '../Logo';
import { ArrowUpRight, Doc, Info } from '../Icons';

type Mode = Modele | 'comparer';
type Answer = { modele: Modele; rep: ReponseChat; demo: boolean };
type Turn = { id: number; question: string; answers: Answer[] | null; voted?: Modele };

/** Remplace les marqueurs [1], [2]… par des pastilles de citation. */
function withCitations(text: string): ReactNode {
  return text.split(/(\[\d+\])/g).map((part, k) => {
    const m = /^\[(\d+)\]$/.exec(part);
    return m ? <span key={k} className="cite">{m[1]}</span> : <Fragment key={k}>{part}</Fragment>;
  });
}

function AnswerBody({ a, t, locale }: { a: Answer; t: ReturnType<typeof useTranslations>; locale: string }) {
  return (
    <>
      {a.demo && <p className="notice" style={{ marginBottom: 14, fontSize: 13 }}><Info size={16} />{t('demo')}</p>}
      <div>{withCitations(a.rep.texte)}</div>
      {a.rep.sources.length > 0 && (
        <div className="sources">
          <p className="kick muted" style={{ fontSize: 11 }}>{t('sources')}</p>
          <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {a.rep.sources.map((s, k) =>
              s.url ? (
                <a key={k} className="src lk" href={s.url} target="_blank" rel="noopener noreferrer"><span className="cite">{k + 1}</span>{s.titre}<ArrowUpRight size={12} /></a>
              ) : (
                <span key={k} className="src"><span className="cite">{k + 1}</span><Doc />{s.titre}</span>
              ),
            )}
          </div>
        </div>
      )}
      {(a.rep.dureeMs != null || a.rep.tokens != null) && (
        <dl className="metrics">
          {a.rep.dureeMs != null && <div><dt>{t('time')}</dt><dd>{new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(a.rep.dureeMs / 1000)} s</dd></div>}
          {a.rep.tokens != null && <div><dt>{t('tokens')}</dt><dd>{new Intl.NumberFormat(locale).format(a.rep.tokens)}</dd></div>}
          <div><dt>{t('sources')}</dt><dd>{a.rep.sources.length}</dd></div>
        </dl>
      )}
    </>
  );
}

export function Chat({ logement, initialQuestion }: { logement: Logement | null; initialQuestion?: string }) {
  const t = useTranslations('assistant');
  const s = useTranslations('home.sim');
  const locale = useLocale();
  const [mode, setMode] = useState<Mode>('claude');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState(initialQuestion ?? '');
  const [phase, setPhase] = useState(0);
  const ctrl = useRef<AbortController | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);
  const busy = turns.some((x) => x.answers === null);

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
    setTurns((ts) => [...ts, { id, question: q, answers: null }]);
    setInput('');
    ctrl.current = new AbortController();
    const models: Modele[] = mode === 'comparer' ? ['claude', 'mistral'] : [mode];
    try {
      const res = await Promise.all(models.map((m) => chat(q, m, logement ?? undefined, ctrl.current!.signal)));
      const answers = res.map((r, k) => ({ modele: models[k], rep: r.data, demo: r.demo }));
      setTurns((ts) => ts.map((x) => (x.id === id ? { ...x, answers } : x)));
    } catch {
      setTurns((ts) => ts.filter((x) => x.id !== id)); // arrêt demandé par l'utilisateur
      setInput(q);
    }
  };

  const vote = (turn: Turn, m: Modele) => {
    if (turn.voted) return;
    setTurns((ts) => ts.map((x) => (x.id === turn.id ? { ...x, voted: m } : x)));
    void sendVote(turn.question, m);
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
                {[t(`types.${logement.type}`), `${logement.surface} m²`, s(`periodes.${logement.periode}`), s(`chauffages.${logement.chauffage}`), logement.codePostal].map((c) => <span key={c} className="chip">{c}</span>)}
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
          <div className="seg" role="group" aria-label={t('modelGroup')}>
            {(['claude', 'mistral', 'comparer'] as const).map((m) => (
              <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)} disabled={busy}>{t(`modes.${m}`)}</button>
            ))}
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
              {turn.answers === null ? (
                <div className="bubble-a" role="status">
                  <span className="avatar" aria-hidden="true"><LogoMark size={26} still /></span>
                  <div className="bubble-a-body" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className="spin" />
                    <span><span className="sr-only">{t('preparing')} : </span>{phases[phase]}…</span>
                  </div>
                </div>
              ) : turn.answers.length === 1 ? (
                <div className="bubble-a">
                  <span className="avatar" aria-hidden="true"><LogoMark size={26} still /></span>
                  <div className="bubble-a-body">
                    <p className="kick muted" style={{ fontSize: 11, marginBottom: 10 }}>{t(`modes.${turn.answers[0].modele}`)}</p>
                    <AnswerBody a={turn.answers[0]} t={t} locale={locale} />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="compare">
                    {turn.answers.map((a) => (
                      <div key={a.modele} className={turn.voted === a.modele ? 'model-card voted' : 'model-card'} style={{ whiteSpace: 'pre-wrap', lineHeight: 1.65 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, whiteSpace: 'normal' }}>
                          <p className="h3" style={{ fontSize: 20 }}>{t(`modes.${a.modele}`)}</p>
                          <button type="button" className="btn-o btn-sm" aria-pressed={turn.voted === a.modele} disabled={!!turn.voted && turn.voted !== a.modele} onClick={() => vote(turn, a.modele)}>
                            {turn.voted === a.modele ? t('voted') : t('vote')}
                          </button>
                        </div>
                        <AnswerBody a={a} t={t} locale={locale} />
                      </div>
                    ))}
                  </div>
                  <p className="small" style={{ marginTop: 12, fontSize: 12.5 }}>{t('compareNote')}</p>
                </div>
              )}
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
