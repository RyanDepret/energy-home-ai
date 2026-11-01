import type { ApiResult, Importance, Logement, ModeleChat, Prediction, Recommandations, ReponseChat } from './types';
import type { DpeClass } from './dpe';
import { anneeDebutPeriode } from './logement';
import { demoChat, demoRecommandations, demoPrediction } from './demo';

/**
 * Client de l'API FastAPI d'EnergyHome AI (dépôt energyhome-api, branche v2).
 * Le contrat est celui du code de l'API (`app/schemas/`, `app/api/`) ; il est résumé dans README.md.
 *
 * Mode démonstration : UNIQUEMENT quand l'API est injoignable (pas d'URL, erreur réseau, délai dépassé).
 * Une réponse d'erreur de l'API (422, 500…) est remontée sous forme d'`ApiError`, jamais remplacée par une démo.
 */
const API = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');

/** Erreur renvoyée par l'API elle-même (elle a répondu, mais avec un code d'erreur). */
export class ApiError extends Error {
  /** `code` : champ `code` du corps d'erreur, s'il existe (`modele_indisponible`, `recherche_indisponible`, `erreur_interne`). */
  constructor(public status: number, message: string, public code?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Message lisible d'une erreur FastAPI : `detail` est une chaîne, ou une liste `{ msg }` pour une 422. */
function messageErreur(body: unknown): string | null {
  const detail = (body as { detail?: unknown } | null)?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    const msgs = detail
      .map((d) => (typeof d?.msg === 'string' ? d.msg.replace(/^Value error,\s*/, '') : null))
      .filter((m): m is string => !!m);
    return msgs.length ? msgs.join(' ') : null;
  }
  return null;
}

async function call<T>(path: string, body: unknown, timeoutMs: number, signal?: AbortSignal): Promise<T> {
  if (!API) throw new Error('NEXT_PUBLIC_API_URL non défini');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  signal?.addEventListener('abort', () => ctrl.abort());
  try {
    const res = await fetch(`${API}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      const code = (data as { code?: unknown } | null)?.code;
      throw new ApiError(res.status, messageErreur(data) ?? `API ${path} : ${res.status}`, typeof code === 'string' ? code : undefined);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

/** L'API répond-elle ? (`GET /health`, délai court) */
async function apiJoignable(): Promise<boolean> {
  if (!API) return false;
  try {
    const res = await fetch(`${API}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Repli démo seulement si l'API n'a pas répondu ; sinon l'erreur est relancée.
 * Une erreur 500 non gérée par FastAPI arrive sans en-tête CORS : le navigateur la présente comme une erreur
 * réseau. On vérifie donc `/health` avant de conclure que l'API est injoignable.
 */
async function replier<T>(e: unknown, signal: AbortSignal | undefined, demo: () => T): Promise<ApiResult<T>> {
  if (signal?.aborted || e instanceof ApiError) throw e;
  if (await apiJoignable()) throw new ApiError(500, 'Erreur interne de l’API');
  return { data: demo(), demo: true };
}

export async function predict(l: Logement, signal?: AbortSignal): Promise<ApiResult<Prediction>> {
  // L'API exige exactement un des deux champs : periode ou annee_construction
  const body = {
    surface: l.surface,
    type_batiment: l.type,
    chauffage: l.chauffage,
    code_postal: l.codePostal,
    ...(l.annee != null ? { annee_construction: l.annee } : { periode: l.periode }),
  };
  try {
    const r = await call<{
      classe: DpeClass;
      probabilites: Record<DpeClass, number>;
      importances?: Importance[];
      model_version: string;
    }>('/predict', body, 20000, signal);
    return { data: { classe: r.classe, probabilites: r.probabilites, importances: r.importances ?? [], modelVersion: r.model_version }, demo: false };
  } catch (e) {
    return replier(e, signal, () => demoPrediction(l));
  }
}

type BlocApi = { resume?: string; detail?: string; items?: unknown[] };

/**
 * Recommandations de l'agent (`POST /agent`). `libelleChauffage` est un libellé lisible : l'API l'insère tel quel
 * dans le texte envoyé au modèle de langage. L'année exacte est envoyée si connue, sinon le début de la période.
 */
export async function recommandations(
  l: Logement, classe: DpeClass, locale: string, libelleChauffage: string, signal?: AbortSignal,
): Promise<ApiResult<Recommandations>> {
  try {
    const r = await call<{ recommandations: { situation?: BlocApi; travaux?: BlocApi; aides?: BlocApi } }>('/agent', {
      classe_dpe: classe,
      surface: l.surface,
      annee_construction: l.annee ?? anneeDebutPeriode(l.periode),
      type_batiment: l.type,
      type_chauffage: libelleChauffage,
      code_postal: l.codePostal,
      locale,
    }, 60000, signal);
    const rec = r.recommandations ?? {};
    const items = (b?: BlocApi) => (b?.items ?? []).filter((x): x is string => typeof x === 'string' && x.trim() !== '');
    return {
      data: {
        situation: { resume: rec.situation?.resume ?? '', detail: rec.situation?.detail ?? '' },
        travaux: { resume: rec.travaux?.resume ?? '', items: items(rec.travaux) },
        aides: { resume: rec.aides?.resume ?? '', items: items(rec.aides) },
      },
      demo: false,
    };
  } catch (e) {
    return replier(e, signal, () => demoRecommandations(classe));
  }
}

/**
 * Assistant (`POST /chat`). Pour comparer, appeler deux fois (un modèle après l'autre) : l'API garantit que
 * les sources sont les mêmes pour les deux modèles, seule la génération change.
 */
export async function chat(question: string, locale: string, modele: ModeleChat, signal?: AbortSignal): Promise<ApiResult<ReponseChat>> {
  try {
    const r = await call<{
      reponse: string;
      sources?: { extrait: string; score: number }[];
      modele?: ModeleChat;
      duree_ms?: number;
      tokens?: { entree: number; sortie: number } | null;
    }>('/chat', { question, locale, modele }, 60000, signal);
    return {
      data: {
        texte: r.reponse,
        sources: r.sources ?? [],
        modele: r.modele ?? modele,
        dureeMs: r.duree_ms,
        tokens: r.tokens ?? undefined,
      },
      demo: false,
    };
  } catch (e) {
    return replier(e, signal, () => demoChat(question, modele));
  }
}
