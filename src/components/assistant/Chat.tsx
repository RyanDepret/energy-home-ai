'use client';

import { Fragment, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ApiError, chat } from '@/lib/api';
import { toSearchParams } from '@/lib/logement';
import type { Logement, ModeleChat, ReponseChat, Source } from '@/lib/types';
import { LogoMark } from '../Logo';
import { ArrowUpRight, Info } from '../Icons';

type Mode = ModeleChat | 'comparer';
type Answer = { rep: ReponseChat; demo: boolean };
/** État de la réponse d'un modèle dans un tour de conversation. */
type Slot =
  | { status: 'attente' }
  | { status: 'ok'; answer: Answer }
  | { status: 'erreur'; message: string }
  | { status: 'arrete' };
/**
 * `modeles` : un seul modèle, ou les deux en mode Comparer (appelés l'un après l'autre).
 * `erreur` : erreur commune à tous les modèles (recherche documentaire indisponible).
 */
type Turn = { id: number; question: string; modeles: ModeleChat[]; slots: Partial<Record<ModeleChat, Slot>>; erreur?: string };
type T = ReturnType<typeof useTranslations>;

const MODES: Mode[] = ['claude', 'mistral', 'comparer'];
const memesSources = (a: Source[], b: Source[]) => JSON.stringify(a) === JSON.stringify(b);

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

/** Extraits utilisés, tels que renvoyés par l'API (aucun titre ni lien ajouté). */
function Sources({ sources, demo, label, t, locale }: { sources: Source[]; demo: boolean; label: string; t: T; locale: string }) {
  if (sources.length === 0) return null;
  return (
    <div className="sources">
      <p className="kick muted" style={{ fontSize: 11 }}>{label}</p>
      <ol className="excerpts">
        {sources.map((src, k) => (
          <li key={k} className="excerpt">
            <span className="cite" aria-hidden="true">{k + 1}</span>
            <span>
              {src.extrait}
              {!demo && (
                <span className="mono" style={{ display: 'block', marginTop: 4, fontSize: 11 }}>
                  {t('score', { s: new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(src.score) })}
                </span>
              )}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Modèle, durée de génération et tokens, tels que mesurés par l'API (rien en démonstration). */
function Meta({ a, t, locale }: { a: Answer; t: T; locale: string }) {
  if (a.demo) return null;
  const nf = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  const parts = [t(`modes.${a.rep.modele}`)];
  if (a.rep.dureeMs != null) parts.push(t('duree', { s: nf.format(a.rep.dureeMs / 1000) }));
  if (a.rep.tokens) parts.push(t('tokens', { e: a.rep.tokens.entree, s: a.rep.tokens.sortie }));
  return <p className="mono muted" style={{ margin: '14px 0 0', fontSize: 11.5 }}>{parts.join(' · ')}</p>;
}

/** Réponse d'un seul modèle : texte, modèle et durée, extraits. */
function AnswerBody({ a, t, locale }: { a: Answer; t: T; locale: string }) {
  return (
    <>
      {a.demo && <p className="notice" style={{ marginBottom: 14, fontSize: 13 }}><Info size={16} />{t('demo')}</p>}
      <Formatted text={a.rep.texte} />
      <Meta a={a} t={t} locale={locale} />
      <Sources sources={a.rep.sources} demo={a.demo} label={t('sources')} t={t} locale={locale} />
    </>
  );
}

function Pending({ text, t }: { text: string; t: T }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span className="spin" />
      <span><span className="sr-only">{t('preparing')} : </span>{text}</span>
    </div>
  );
}

function ErrorNotice({ message }: { message: string }) {
  return <p className="notice" style={{ margin: 0 }}><Info size={16} />{message}</p>;
}

/**
 * Mode Comparer : une colonne par modèle (nom, réponse, durée ou message d'erreur), puis les extraits.
 * L'API utilise la même recherche pour les deux modèles : si les extraits sont identiques, ils sont affichés une fois.
 */
function Comparison({ turn, running, phaseText, t, locale }: {
  turn: Turn; running: ModeleChat | null; phaseText: string; t: T; locale: string;
}) {
  const oks = turn.modeles
    .map((m) => turn.slots[m])
    .filter((x): x is Extract<Slot, { status: 'ok' }> => x?.status === 'ok')
    .map((x) => x.answer);
  const communes = oks.length > 0 && oks.every((a) => memesSources(a.rep.sources, oks[0].rep.sources));
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div className="compare">
        {turn.modeles.map((m) => {
          const slot = turn.slots[m];
          return (
            <section key={m} className="model-card" style={{ padding: 22, borderRadius: 18, minWidth: 0 }} aria-label={t(`modes.${m}`)}>
              <p className="kick" style={{ marginBottom: 14 }}>{t(`modes.${m}`)}</p>
              {slot?.status === 'ok' ? (
                <>
                  <Formatted text={slot.answer.rep.texte} />
                  <Meta a={slot.answer} t={t} locale={locale} />
                  {!communes && <Sources sources={slot.answer.rep.sources} demo={slot.answer.demo} label={t('sources')} t={t} locale={locale} />}
                </>
              ) : slot?.status === 'erreur' ? (
                <ErrorNotice message={slot.message} />
              ) : slot?.status === 'arrete' ? (
                <p className="small" style={{ margin: 0 }}>{t('compare.stopped')}</p>
              ) : running === m ? (
                <Pending text={phaseText} t={t} />
              ) : (
                <p className="small" style={{ margin: 0 }}>{t('compare.waiting', { modele: t(`modes.${turn.modeles[0]}`) })}</p>
              )}
            </section>
          );
        })}
      </div>
      {communes && (
        <div className="bubble-a-body" style={{ marginTop: 16 }}>
          <Sources
            sources={oks[0].rep.sources} demo={oks[0].demo} t={t} locale={locale}
            label={t(oks.length > 1 ? 'compare.sourcesCommon' : 'sources')}
          />
        </div>
      )}
    </div>
  );
}

export function Chat({ logement, initialQuestion }: { logement: Logement | null; initialQuestion?: string }) {
  const t = useTranslations('assistant');
  const s = useTranslations('home.sim');
  const locale = useLocale();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState(initialQuestion ?? '');
  const [mode, setMode] = useState<Mode>('claude');
  /** Appel en cours : tour et modèle (null quand l'assistant est libre). */
  const [running, setRunning] = useState<{ id: number; modele: ModeleChat } | null>(null);
  const [phase, setPhase] = useState(0);
  const ctrl = useRef<AbortController | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);
  const busy = running !== null;
  const runKey = running ? `${running.id}-${running.modele}` : null;

  useEffect(() => () => ctrl.current?.abort(), []);
  useEffect(() => {
    if (!runKey) return;
    setPhase(0);
    const id = setInterval(() => setPhase((p) => Math.min(p + 1, 2)), 1100);
    return () => clearInterval(id);
  }, [runKey]);
  useEffect(() => {
    logRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [turns]);

  /** Message d'erreur traduit (le `detail` de l'API n'existe qu'en français). */
  const messageErreur = (e: unknown, m: ModeleChat) =>
    t(e instanceof ApiError && e.code === 'modele_indisponible' ? 'errors.modele' : 'errors.generique', { modele: t(`modes.${m}`) });

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || busy) return;
    const id = nextId.current++;
    const modeles: ModeleChat[] = mode === 'comparer' ? ['claude', 'mistral'] : [mode];
    const update = (f: (x: Turn) => Turn) => setTurns((ts) => ts.map((x) => (x.id === id ? f(x) : x)));
    const setSlot = (m: ModeleChat, slot: Slot) => update((x) => ({ ...x, slots: { ...x.slots, [m]: slot } }));
    const attente: Turn['slots'] = {};
    for (const m of modeles) attente[m] = { status: 'attente' };
    setTurns((ts) => [...ts, { id, question: q, modeles, slots: attente }]);
    setInput('');
    const signal = (ctrl.current = new AbortController()).signal;
    try {
      // L'un après l'autre, jamais en parallèle : ménage la limite de débit de Mistral.
      for (const [i, m] of modeles.entries()) {
        setRunning({ id, modele: m });
        try {
          const r = await chat(q, locale, m, signal);
          if (r.demo && i > 0) {
            // L'API ne répond plus après le premier appel : erreur pour ce modèle, pas de réponse d'exemple.
            setSlot(m, { status: 'erreur', message: t('errors.generique', { modele: t(`modes.${m}`) }) });
            continue;
          }
          if (r.demo) {
            // API injoignable : une seule réponse d'exemple, jamais une fausse comparaison.
            update((x) => ({ ...x, modeles: [m], slots: { [m]: { status: 'ok', answer: { rep: r.data, demo: true } } } }));
            return;
          }
          setSlot(m, { status: 'ok', answer: { rep: r.data, demo: false } });
        } catch (e) {
          if (signal.aborted) {
            if (i === 0) {
              setTurns((ts) => ts.filter((x) => x.id !== id)); // arrêt demandé pendant le premier appel
              setInput(q);
            } else {
              // arrêt en mode Comparer pendant le second appel : le résultat du premier est conservé
              update((x) => {
                const slots: Turn['slots'] = {};
                for (const k of x.modeles) slots[k] = x.slots[k]?.status === 'attente' ? { status: 'arrete' } : x.slots[k];
                return { ...x, slots };
              });
            }
            return;
          }
          if (e instanceof ApiError && e.code === 'recherche_indisponible') {
            if (i === 0) {
              // La recherche est commune aux deux modèles : inutile d'appeler le second.
              update((x) => ({ ...x, erreur: t('errors.recherche') }));
              return;
            }
            setSlot(m, { status: 'erreur', message: t('errors.recherche') });
            continue;
          }
          setSlot(m, { status: 'erreur', message: messageErreur(e, m) });
        }
      }
    } finally {
      setRunning(null);
    }
  };

  const submit = (e: FormEvent) => { e.preventDefault(); void ask(input); };
  const reset = () => { ctrl.current?.abort(); setTurns([]); setInput(''); };
  const phases = t.raw('phases') as string[];
  const phaseText = `${phases[phase]}…`;
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
          <div className="seg" role="group" aria-label={t('modelGroup')}>
            {MODES.map((m) => (
              <button key={m} type="button" aria-pressed={mode === m} disabled={busy} onClick={() => setMode(m)}>{t(`modes.${m}`)}</button>
            ))}
          </div>
        </div>

        <div className="chat-log" ref={logRef} aria-live="polite">
          <div className="bubble-a">
            <span className="avatar" aria-hidden="true"><LogoMark size={26} still /></span>
            <div className="bubble-a-body">{t('welcome')}</div>
          </div>

          {turns.map((turn) => {
            const compare = turn.modeles.length > 1;
            const seul = turn.slots[turn.modeles[0]];
            const enCours = running?.id === turn.id;
            return (
              <Fragment key={turn.id}>
                <div className="bubble-u">{turn.question}</div>
                <div className={compare && !turn.erreur ? 'bubble-a wide' : 'bubble-a'} role={enCours ? 'status' : undefined}>
                  <span className="avatar" aria-hidden="true"><LogoMark size={26} still /></span>
                  {turn.erreur ? (
                    <div className="bubble-a-body"><ErrorNotice message={turn.erreur} /></div>
                  ) : compare ? (
                    <Comparison turn={turn} running={enCours ? running.modele : null} phaseText={phaseText} t={t} locale={locale} />
                  ) : seul?.status === 'ok' ? (
                    <div className="bubble-a-body"><AnswerBody a={seul.answer} t={t} locale={locale} /></div>
                  ) : seul?.status === 'erreur' ? (
                    <div className="bubble-a-body"><ErrorNotice message={seul.message} /></div>
                  ) : (
                    <div className="bubble-a-body"><Pending text={phaseText} t={t} /></div>
                  )}
                </div>
              </Fragment>
            );
          })}
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
          <p className="small" style={{ marginTop: 10, fontSize: 12 }}>
            {mode === 'comparer' ? `${t('compare.hint')} ` : ''}{t('disclaimer')}
          </p>
        </form>
      </div>
    </div>
  );
}
